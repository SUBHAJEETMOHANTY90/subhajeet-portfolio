/**
 * Server-side collector #3: distributed traces (Tempo / Jaeger compatible).
 *
 * Metrics tell you THAT the service got slow. Traces tell you WHERE.
 * This pulls the slowest spans in the test window and aggregates them by
 * operation, so the report can name the exact hop that dominated latency.
 */

/**
 * @param {object} opts
 * @param {"tempo"|"jaeger"} opts.flavor
 * @param {string} opts.baseUrl
 * @param {string} [opts.token]
 * @param {string} opts.service
 * @param {number} opts.startMs
 * @param {number} opts.stopMs
 * @param {number} [opts.limit]
 */
export async function collectTraces(opts) {
  const limit = opts.limit ?? 100;
  try {
    const traces =
      opts.flavor === "jaeger"
        ? await fetchJaeger(opts, limit)
        : await fetchTempo(opts, limit);

    return {
      source: `traces/${opts.flavor}`,
      service: opts.service,
      topSpans: aggregate(traces),
    };
  } catch {
    return { source: `traces/${opts.flavor}`, service: opts.service, topSpans: [] };
  }
}

async function fetchJaeger(opts, limit) {
  const url = new URL("/api/traces", opts.baseUrl);
  url.searchParams.set("service", opts.service);
  url.searchParams.set("start", String(opts.startMs * 1000)); // jaeger wants micros
  url.searchParams.set("end", String(opts.stopMs * 1000));
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url, {
    headers: opts.token ? { Authorization: `Bearer ${opts.token}` } : {},
  });
  if (!res.ok) throw new Error(`Jaeger ${res.status}`);
  const body = await res.json();

  const spans = [];
  for (const trace of body.data ?? []) {
    for (const s of trace.spans ?? []) {
      spans.push({ name: s.operationName, durationMs: (s.duration ?? 0) / 1000 });
    }
  }
  return spans;
}

async function fetchTempo(opts, limit) {
  const url = new URL("/api/search", opts.baseUrl);
  url.searchParams.set("tags", `service.name=${opts.service}`);
  url.searchParams.set("start", String(Math.floor(opts.startMs / 1000)));
  url.searchParams.set("end", String(Math.floor(opts.stopMs / 1000)));
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url, {
    headers: opts.token ? { Authorization: `Bearer ${opts.token}` } : {},
  });
  if (!res.ok) throw new Error(`Tempo ${res.status}`);
  const body = await res.json();

  return (body.traces ?? []).map((t) => ({
    name: t.rootTraceName ?? t.name ?? "unknown",
    durationMs: t.durationMs ?? 0,
  }));
}

/** Group spans by operation and rank by total time contributed. */
function aggregate(spans) {
  const byName = new Map();
  for (const s of spans) {
    const e = byName.get(s.name) ?? { name: s.name, count: 0, total: 0, max: 0, samples: [] };
    e.count += 1;
    e.total += s.durationMs;
    e.max = Math.max(e.max, s.durationMs);
    e.samples.push(s.durationMs);
    byName.set(s.name, e);
  }

  return [...byName.values()]
    .map((e) => ({
      name: e.name,
      count: e.count,
      avg_ms: round(e.total / e.count),
      p95_ms: round(percentile(e.samples, 95)),
      max_ms: round(e.max),
      total_ms: round(e.total),
    }))
    .sort((a, b) => b.total_ms - a.total_ms)
    .slice(0, 10);
}

function percentile(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[idx];
}

function round(v, digits = 2) {
  const f = 10 ** digits;
  return Math.round(Number(v) * f) / f;
}
