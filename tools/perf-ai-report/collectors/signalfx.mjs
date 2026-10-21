/**
 * Server-side collector #2: SignalFx / Splunk Observability Cloud.
 *
 * Uses the SignalFlow `execute` API, which is the programmatic equivalent of a
 * chart: you send a small SignalFlow program, it streams back data points for
 * the requested window. We aggregate each program down to a single number so it
 * can sit next to the k6 and Prometheus numbers in the same report.
 */

/**
 * Default SignalFlow programs. Override in
 * config.json -> serverMetrics.signalfx.programs
 *
 * `$svc` / `$ns` are substituted before execution.
 */
export const DEFAULT_PROGRAMS = {
  service_p90_ms:
    `data('service.request.duration.ns.p90', filter=filter('sf_service','$svc')).mean().publish()`,
  service_error_rate:
    `data('service.request.count', filter=filter('sf_service','$svc') and filter('sf_error','true')).sum() / data('service.request.count', filter=filter('sf_service','$svc')).sum()`,
  cpu_utilization_pct:
    `data('container_cpu_utilization', filter=filter('k8s.namespace.name','$ns')).mean().publish()`,
  memory_utilization_pct:
    `data('k8s.container.memory_utilization', filter=filter('k8s.namespace.name','$ns')).max().publish()`,
  pod_restarts:
    `data('k8s.container.restarts', filter=filter('k8s.namespace.name','$ns')).sum().publish()`,
};

function render(tpl, { svc, ns }) {
  return tpl.replaceAll("$svc", svc).replaceAll("$ns", ns);
}

/**
 * Execute one SignalFlow program and reduce the streamed points to a single
 * aggregate (mean by default).
 */
async function runProgram({ realm, token, program, startMs, stopMs, reducer = "mean" }) {
  const url = new URL(`https://stream.${realm}.signalfx.com/v2/signalflow/execute`);
  url.searchParams.set("start", String(startMs));
  url.searchParams.set("stop", String(stopMs));
  url.searchParams.set("immediate", "true");
  url.searchParams.set("resolution", "10000");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "X-SF-Token": token,
      Accept: "text/plain",
    },
    body: program,
  });
  if (!res.ok) throw new Error(`SignalFx ${res.status}: ${await res.text()}`);

  // The response is newline-delimited JSON messages; data messages carry
  // { type: "data", data: [{ tsId, value }] }
  const text = await res.text();
  const values = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    if (msg.type === "data" && Array.isArray(msg.data)) {
      for (const d of msg.data) {
        if (typeof d.value === "number") values.push(d.value);
      }
    }
  }
  if (!values.length) return null;

  if (reducer === "max") return Math.max(...values);
  if (reducer === "sum") return values.reduce((a, b) => a + b, 0);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * @param {object} opts
 * @param {string} opts.realm      e.g. "us1", "eu0"
 * @param {string} opts.token      SignalFx access token
 * @param {string} opts.service    sf_service of the system under test
 * @param {string} opts.namespace  k8s namespace
 * @param {number} opts.startMs    epoch ms, start of the load test
 * @param {number} opts.stopMs     epoch ms, end of the load test
 * @param {object} [opts.programs] overrides / extra programs
 */
export async function collectSignalFx(opts) {
  const programs = { ...DEFAULT_PROGRAMS, ...(opts.programs ?? {}) };
  const ctx = { svc: opts.service, ns: opts.namespace };

  const entries = await Promise.all(
    Object.entries(programs).map(async ([name, tpl]) => {
      try {
        const value = await runProgram({
          realm: opts.realm,
          token: opts.token,
          program: render(tpl, ctx),
          startMs: opts.startMs,
          stopMs: opts.stopMs,
          reducer: name.includes("restart") ? "sum" : name.includes("max") ? "max" : "mean",
        });
        // durations arrive in nanoseconds for *.ns.* metrics
        const scaled =
          value !== null && name.endsWith("_ms") && tpl.includes(".ns.")
            ? value / 1_000_000
            : value;
        return [name, scaled === null ? null : round(scaled)];
      } catch {
        return [name, null];
      }
    })
  );

  return {
    source: "signalfx",
    service: opts.service,
    namespace: opts.namespace,
    metrics: Object.fromEntries(entries),
  };
}

function round(v, digits = 2) {
  const f = 10 ** digits;
  return Math.round(Number(v) * f) / f;
}
