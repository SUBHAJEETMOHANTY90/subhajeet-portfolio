/**
 * Client-side collector: parses a k6 summary JSON
 * (`k6 run --summary-export=summary.json` or a handleSummary() dump).
 *
 * Returns a normalised shape so the rest of the pipeline never needs to know
 * which k6 version/output produced it.
 */
import { readFile } from "node:fs/promises";

/** Pull a value out of a k6 metric object, tolerating naming differences. */
function pick(metric, keys, fallback = null) {
  if (!metric) return fallback;
  for (const k of keys) {
    if (metric[k] !== undefined && metric[k] !== null) return metric[k];
  }
  return fallback;
}

export async function collectK6(path) {
  const raw = JSON.parse(await readFile(path, "utf8"));
  const m = raw.metrics ?? raw;

  const dur = m.http_req_duration ?? {};
  const failed = m.http_req_failed ?? {};
  const reqs = m.http_reqs ?? {};
  const waiting = m.http_req_waiting ?? {};
  const iterations = m.iterations ?? {};

  // k6 writes percentiles as "p(95)"; some exporters flatten them to "p95".
  const p95 = pick(dur, ["p(95)", "p95"], null);
  const p99 = pick(dur, ["p(99)", "p99"], null);

  const metrics = {
    p95_ms: round(p95),
    p99_ms: round(p99),
    avg_ms: round(pick(dur, ["avg"])),
    max_ms: round(pick(dur, ["max"])),
    // time waiting on the server = TTFB; isolates server time from network
    server_wait_p95_ms: round(pick(waiting, ["p(95)", "p95"])),
    error_rate: round(pick(failed, ["rate", "value"], 0), 4),
    tps: round(pick(reqs, ["rate"])),
    total_requests: pick(reqs, ["count"], 0),
    iterations: pick(iterations, ["count"], 0),
    vus_max: pick(m.vus_max ?? {}, ["value", "max"], null),
  };

  // Threshold results, if k6 recorded them.
  const thresholds = {};
  for (const [name, metric] of Object.entries(m)) {
    if (metric && typeof metric === "object" && metric.thresholds) {
      for (const [expr, res] of Object.entries(metric.thresholds)) {
        thresholds[`${name}: ${expr}`] = res?.ok ?? res === true;
      }
    }
  }

  // Per-endpoint breakdown when the script tagged requests with { name: ... }.
  const byEndpoint = (raw.root_group?.groups ? flattenGroups(raw.root_group) : []).filter(Boolean);

  return {
    source: "k6",
    window: {
      start: raw.state?.testRunDurationMs
        ? new Date(Date.now() - raw.state.testRunDurationMs).toISOString()
        : raw.window?.start ?? null,
      end: raw.window?.end ?? new Date().toISOString(),
    },
    metrics,
    thresholds,
    byEndpoint,
  };
}

function flattenGroups(group, prefix = "") {
  const out = [];
  for (const [name, g] of Object.entries(group.groups ?? {})) {
    const label = prefix ? `${prefix} / ${name}` : name;
    const d = g.checks ? null : null;
    out.push(d);
    out.push(...flattenGroups(g, label));
  }
  return out;
}

function round(v, digits = 2) {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return null;
  const f = 10 ** digits;
  return Math.round(Number(v) * f) / f;
}
