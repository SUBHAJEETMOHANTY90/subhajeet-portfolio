/**
 * Correlation engine.
 *
 * This is where client-side (k6) and server-side (Prometheus/OTel, SignalFx,
 * traces) numbers are compared against each other to produce *evidence-backed
 * findings*. These findings are deterministic — the LLM later turns them into
 * prose, but the reasoning itself is reproducible and reviewable.
 *
 * Each rule answers one question a performance engineer would ask by hand.
 */

const SEV = { HIGH: "HIGH", MEDIUM: "MEDIUM", LOW: "LOW", INFO: "INFO" };

export function correlate({ k6, server = {}, traces = {} }) {
  const c = k6?.metrics ?? {};
  const s = server?.metrics ?? {};
  const findings = [];

  const add = (f) => findings.push(f);
  const has = (v) => v !== null && v !== undefined && !Number.isNaN(Number(v));

  // ------------------------------------------------------------------
  // 1. Where is the time spent: client-observed vs server-reported?
  // ------------------------------------------------------------------
  if (has(c.p95_ms) && has(s.server_p95_ms)) {
    const gap = c.p95_ms - s.server_p95_ms;
    const gapPct = (gap / c.p95_ms) * 100;

    if (gapPct > 40) {
      add({
        severity: SEV.HIGH,
        title: "Latency is being added outside the application",
        evidence: `Client p95 ${c.p95_ms} ms vs server-reported p95 ${s.server_p95_ms} ms — ${round(gapPct)}% of the time is not accounted for by the service itself.`,
        hypothesis:
          "Time is going to network, TLS, ingress/service-mesh hops, request queueing before the handler, or the load generator itself is saturated.",
        action:
          "Check load-generator CPU, ingress/proxy latency and connection reuse (keep-alive). Re-run with the generator in the same namespace to remove network variance.",
      });
    } else if (gapPct < 15) {
      add({
        severity: SEV.INFO,
        title: "Latency originates inside the application",
        evidence: `Client p95 ${c.p95_ms} ms closely tracks server p95 ${s.server_p95_ms} ms (gap ${round(gapPct)}%).`,
        hypothesis: "The service's own processing dominates response time.",
        action: "Focus tuning on in-process work: downstream calls, DB, serialization, GC.",
      });
    }
  }

  // ------------------------------------------------------------------
  // 2. CPU: is the container starved or throttled?
  // ------------------------------------------------------------------
  if (has(s.cpu_throttle_pct) && s.cpu_throttle_pct > 10) {
    add({
      severity: s.cpu_throttle_pct > 25 ? SEV.HIGH : SEV.MEDIUM,
      title: "Container CPU throttling detected",
      evidence: `CPU was throttled ${s.cpu_throttle_pct}% of scheduling periods during the test.`,
      hypothesis:
        "CPU limits are set too close to actual demand, so the kernel is pausing the workload — this shows up as latency spikes rather than high CPU.",
      action:
        "Raise the CPU limit (or remove it and rely on requests), then re-run. Throttling above ~10% almost always explains p99 outliers.",
    });
  }

  if (has(s.cpu_utilization_pct) && s.cpu_utilization_pct > 85) {
    add({
      severity: SEV.HIGH,
      title: "CPU saturation on the system under test",
      evidence: `Average CPU utilisation reached ${s.cpu_utilization_pct}%.`,
      hypothesis: "The service is compute-bound at this load level.",
      action:
        "Confirm the HPA scaled as expected; if it hit max replicas, raise the ceiling or profile hot code paths.",
    });
  }

  // ------------------------------------------------------------------
  // 3. Memory / runtime internals
  // ------------------------------------------------------------------
  if (has(s.gc_pause_p95_ms) && has(c.p95_ms) && s.gc_pause_p95_ms > 0.15 * c.p95_ms) {
    add({
      severity: SEV.HIGH,
      title: "GC pauses are a significant share of response time",
      evidence: `GC pause p95 ${s.gc_pause_p95_ms} ms against request p95 ${c.p95_ms} ms (${round((s.gc_pause_p95_ms / c.p95_ms) * 100)}%).`,
      hypothesis:
        "Allocation rate or heap sizing is causing frequent/long collections that stall request threads.",
      action:
        "Capture a heap dump and GC log for this window; review heap sizing and object churn on the hot path.",
    });
  }

  if (has(s.heap_used_pct) && s.heap_used_pct > 85) {
    add({
      severity: SEV.MEDIUM,
      title: "Heap pressure",
      evidence: `Peak heap utilisation ${s.heap_used_pct}%.`,
      hypothesis: "The workload is close to its memory ceiling; risk of long GC or OOM at higher load.",
      action: "Increase heap/memory limits or reduce retained objects before scaling the test up.",
    });
  }

  if (has(s.eventloop_lag_p95_ms) && s.eventloop_lag_p95_ms > 50) {
    add({
      severity: SEV.HIGH,
      title: "Node.js event loop is blocked",
      evidence: `Event-loop lag p95 ${s.eventloop_lag_p95_ms} ms.`,
      hypothesis:
        "Synchronous CPU-bound work (JSON parsing, crypto, templating) is blocking the loop, so every concurrent request queues behind it.",
      action: "Profile with clinic/0x; move blocking work off the loop or into worker threads.",
    });
  }

  // ------------------------------------------------------------------
  // 4. Downstream dependencies: DB, other services, pools
  // ------------------------------------------------------------------
  if (has(s.db_p95_ms) && has(s.server_p95_ms) && s.db_p95_ms > 0.4 * s.server_p95_ms) {
    add({
      severity: SEV.HIGH,
      title: "Database time dominates the request",
      evidence: `DB p95 ${s.db_p95_ms} ms is ${round((s.db_p95_ms / s.server_p95_ms) * 100)}% of server p95 ${s.server_p95_ms} ms.`,
      hypothesis: "Missing index, N+1 query pattern, or lock contention under concurrency.",
      action:
        "Pull the slowest statements for this window and check execution plans; verify indexes on the hot predicate.",
    });
  }

  if (has(s.downstream_p95_ms) && has(s.server_p95_ms) && s.downstream_p95_ms > 0.4 * s.server_p95_ms) {
    add({
      severity: SEV.MEDIUM,
      title: "A downstream service is the bottleneck",
      evidence: `Outbound HTTP p95 ${s.downstream_p95_ms} ms vs server p95 ${s.server_p95_ms} ms.`,
      hypothesis: "The service is waiting on a dependency rather than doing its own work.",
      action:
        "Add timeouts/bulkheads so a slow dependency cannot exhaust threads, and raise the regression with that service's owner.",
    });
  }

  if (has(s.connection_pool_saturation_pct) && s.connection_pool_saturation_pct > 80) {
    add({
      severity: SEV.HIGH,
      title: "Connection pool near exhaustion",
      evidence: `Pool utilisation peaked at ${s.connection_pool_saturation_pct}%.`,
      hypothesis:
        "Requests are queueing for a connection — latency rises sharply while CPU stays low.",
      action: "Increase pool size or reduce per-request hold time; re-test to confirm the knee moves.",
    });
  }

  // ------------------------------------------------------------------
  // 5. Stability
  // ------------------------------------------------------------------
  if (has(s.pod_restarts) && s.pod_restarts > 0) {
    add({
      severity: SEV.HIGH,
      title: "Pods restarted during the test",
      evidence: `${s.pod_restarts} container restart(s) in the test window.`,
      hypothesis:
        "OOMKill or a failing liveness probe under load — results after the first restart are not trustworthy.",
      action:
        "Check exit codes and memory limits; treat this run as invalid for capacity conclusions until it is stable.",
    });
  }

  if (has(c.error_rate) && c.error_rate > 0.01) {
    add({
      severity: c.error_rate > 0.05 ? SEV.HIGH : SEV.MEDIUM,
      title: "Elevated error rate",
      evidence: `Client error rate ${(c.error_rate * 100).toFixed(2)}%${
        has(s.server_error_rate) ? `, server-side 5xx rate ${(s.server_error_rate * 100).toFixed(2)}%` : ""
      }.`,
      hypothesis:
        has(s.server_error_rate) && s.server_error_rate < c.error_rate / 2
          ? "Errors are mostly seen by the client but not reported by the service — suspect timeouts, connection resets or ingress-level rejection."
          : "The service is actively returning failures under this load.",
      action: "Inspect status-code breakdown and the first failing timestamp relative to the ramp-up.",
    });
  }

  // ------------------------------------------------------------------
  // 6. Scaling behaviour
  // ------------------------------------------------------------------
  if (has(c.tps) && has(c.vus_max) && has(s.pod_count_max)) {
    add({
      severity: SEV.INFO,
      title: "Throughput and scaling summary",
      evidence: `${c.tps} req/s sustained with ${c.vus_max} VUs across up to ${s.pod_count_max} ready pod(s).`,
      hypothesis: "Baseline for comparing future runs at the same load profile.",
      action: "Track req/s per pod over time; a drop at equal load is an early regression signal.",
    });
  }

  // ------------------------------------------------------------------
  // 7. Traces: name the single hottest operation
  // ------------------------------------------------------------------
  const top = traces?.topSpans?.[0];
  if (top) {
    add({
      severity: SEV.MEDIUM,
      title: `Hottest operation: ${top.name}`,
      evidence: `${top.name} — p95 ${top.p95_ms} ms, max ${top.max_ms} ms across ${top.count} sampled spans.`,
      hypothesis: "This operation contributed the most total time during the window.",
      action: "Start root-cause analysis here before looking anywhere else.",
    });
  }

  const order = { HIGH: 0, MEDIUM: 1, LOW: 2, INFO: 3 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);
  return findings;
}

function round(v, digits = 1) {
  const f = 10 ** digits;
  return Math.round(Number(v) * f) / f;
}
