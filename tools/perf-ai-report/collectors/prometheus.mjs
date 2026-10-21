/**
 * Server-side collector #1: Prometheus / OpenTelemetry metrics backend.
 *
 * Runs PromQL *instant* queries evaluated over the exact load-test window, so
 * every server-side number lines up with the k6 client-side numbers.
 *
 * Works against anything with a Prometheus-compatible API: Prometheus, Thanos,
 * Mimir, Grafana Cloud, Azure Monitor managed Prometheus, an OTel Collector
 * with a prometheus exporter, etc.
 */

/**
 * Default queries use OpenTelemetry semantic-convention metric names.
 * Override any of them in config.json -> serverMetrics.prometheus.queries
 *
 * `$w` is replaced by the test window duration (e.g. "10m")
 * `$svc` is replaced by the service name
 * `$ns` is replaced by the kubernetes namespace
 */
export const DEFAULT_QUERIES = {
  // ---- RED: Rate, Errors, Duration (what the server thinks it served) ----
  server_p95_ms: `1000 * histogram_quantile(0.95, sum(rate(http_server_duration_seconds_bucket{service_name="$svc"}[$w])) by (le))`,
  server_p99_ms: `1000 * histogram_quantile(0.99, sum(rate(http_server_duration_seconds_bucket{service_name="$svc"}[$w])) by (le))`,
  server_rps: `sum(rate(http_server_duration_seconds_count{service_name="$svc"}[$w]))`,
  server_error_rate: `sum(rate(http_server_duration_seconds_count{service_name="$svc",http_status_code=~"5.."}[$w])) / clamp_min(sum(rate(http_server_duration_seconds_count{service_name="$svc"}[$w])), 1)`,

  // ---- USE: Utilisation, Saturation, Errors (why it behaved that way) ----
  cpu_cores_used: `sum(rate(container_cpu_usage_seconds_total{namespace="$ns",container!=""}[$w]))`,
  cpu_throttle_pct: `100 * sum(rate(container_cpu_cfs_throttled_periods_total{namespace="$ns"}[$w])) / clamp_min(sum(rate(container_cpu_cfs_periods_total{namespace="$ns"}[$w])), 1)`,
  memory_working_set_mb: `max(container_memory_working_set_bytes{namespace="$ns",container!=""}) / 1024 / 1024`,
  pod_restarts: `sum(increase(kube_pod_container_status_restarts_total{namespace="$ns"}[$w]))`,
  pod_count_max: `max_over_time(sum(kube_deployment_status_replicas_ready{namespace="$ns"})[$w:])`,

  // ---- Runtime internals: the usual suspects behind latency cliffs ----
  gc_pause_p95_ms: `1000 * histogram_quantile(0.95, sum(rate(jvm_gc_pause_seconds_bucket{namespace="$ns"}[$w])) by (le))`,
  heap_used_pct: `100 * max(jvm_memory_used_bytes{area="heap",namespace="$ns"}) / clamp_min(max(jvm_memory_max_bytes{area="heap",namespace="$ns"}), 1)`,
  eventloop_lag_p95_ms: `1000 * histogram_quantile(0.95, sum(rate(nodejs_eventloop_lag_seconds_bucket{namespace="$ns"}[$w])) by (le))`,

  // ---- Downstream: where the time actually goes ----
  db_p95_ms: `1000 * histogram_quantile(0.95, sum(rate(db_client_operation_duration_seconds_bucket{service_name="$svc"}[$w])) by (le))`,
  downstream_p95_ms: `1000 * histogram_quantile(0.95, sum(rate(http_client_duration_seconds_bucket{service_name="$svc"}[$w])) by (le))`,
  connection_pool_saturation_pct: `100 * max(db_client_connections_usage{state="used",service_name="$svc"}) / clamp_min(max(db_client_connections_max{service_name="$svc"}), 1)`,
};

function render(tpl, { svc, ns, w }) {
  return tpl.replaceAll("$svc", svc).replaceAll("$ns", ns).replaceAll("$w", w);
}

async function promQuery({ baseUrl, token, query, time }) {
  const url = new URL("/api/v1/query", baseUrl);
  url.searchParams.set("query", query);
  if (time) url.searchParams.set("time", time);

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Prometheus ${res.status}: ${await res.text()}`);

  const body = await res.json();
  const first = body?.data?.result?.[0];
  const value = first?.value?.[1];
  return value === undefined ? null : Number(value);
}

/**
 * @param {object} opts
 * @param {string} opts.baseUrl   Prometheus-compatible endpoint
 * @param {string} [opts.token]   Bearer token
 * @param {string} opts.service   service.name of the system under test
 * @param {string} opts.namespace k8s namespace
 * @param {string} opts.window    test duration, e.g. "10m"
 * @param {string} [opts.endTime] RFC3339 end of the test window
 * @param {object} [opts.queries] overrides / extra queries
 */
export async function collectPrometheus(opts) {
  const queries = { ...DEFAULT_QUERIES, ...(opts.queries ?? {}) };
  const ctx = { svc: opts.service, ns: opts.namespace, w: opts.window };

  const entries = await Promise.all(
    Object.entries(queries).map(async ([name, tpl]) => {
      try {
        const value = await promQuery({
          baseUrl: opts.baseUrl,
          token: opts.token,
          query: render(tpl, ctx),
          time: opts.endTime,
        });
        return [name, value === null ? null : round(value)];
      } catch (err) {
        // A missing metric must never fail the report — mark it unavailable.
        return [name, null];
      }
    })
  );

  return {
    source: "prometheus/otel",
    service: opts.service,
    namespace: opts.namespace,
    metrics: Object.fromEntries(entries),
  };
}

function round(v, digits = 2) {
  const f = 10 ** digits;
  return Math.round(Number(v) * f) / f;
}
