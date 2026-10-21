# perf-ai-report

Turn a load test into a **decision**, not a dashboard.

It collects **client-side** results (k6) and **server-side** metrics
(Prometheus/OpenTelemetry, SignalFx / Splunk Observability, distributed traces),
correlates them, applies a **deterministic SLA gate**, and then asks an LLM to
write the analysis.

```
k6 summary   ─┐
Prometheus    ├─► correlate ─► SLA gate (deterministic) ─► AI narrative ─► Markdown report
SignalFx      │                      │
Traces       ─┘                      └─ decides PASS / FAIL  (AI never overrides it)
```

## Why both sides matter

| Question | Answered by |
| --- | --- |
| How slow was it for the user? | k6 — client p95/p99, error rate, TPS |
| How slow did the service *think* it was? | OTel `http_server_duration` |
| Why was it slow? | CPU throttling, GC pauses, heap, event-loop lag, pool saturation |
| **Where** exactly? | traces — slowest spans (DB, downstream call, cache) |

The gap between **client p95** and **server p95** is the single most useful
number in the report: a big gap means the time is outside the app (network,
ingress, queueing, saturated load generator); a small gap means the app itself
owns the latency.

## Quick start

```bash
cd tools/perf-ai-report

# 1) run it offline against the bundled sample (no backends, no API key)
node index.mjs --config sample/config.json --k6 sample/k6-summary.json --offline --out sample/REPORT.md

# 2) real run: produce a k6 summary first
k6 run --summary-export=summary.json tests/k6/getEntityByCode/load-test.js

# 3) generate the report (AI narrative enabled)
export OPENAI_API_KEY=sk-...
node index.mjs --config config.json --k6 summary.json --out REPORT.md --fail-on-gate
```

### CLI flags

| Flag | Meaning |
| --- | --- |
| `--config <file>` | JSON config (service, SLAs, backends) |
| `--k6 <file>` | k6 summary JSON from `--summary-export` |
| `--out <file>` | where to write the Markdown report |
| `--offline` | skip the LLM; render the deterministic narrative |
| `--fail-on-gate` | exit `1` when the SLA gate fails (use in CI) |

## Configuration

```jsonc
{
  "service": "entity-api",          // service.name in OTel
  "environment": "dev-euwe",
  "namespace": "entity-api",        // k8s namespace
  "run": { "testScript": "load-test.js", "vus": 50, "rampUp": "2m", "duration": "10m" },

  // The gate. Metrics may come from EITHER side — client or server.
  "slas": [
    { "metric": "p95_ms",              "op": "<",  "value": 800,  "label": "Client p95 (ms)" },
    { "metric": "error_rate",          "op": "<",  "value": 0.01, "label": "Error rate" },
    { "metric": "server_p95_ms",       "op": "<",  "value": 600,  "label": "Server p95 (ms)" },
    { "metric": "cpu_utilization_pct", "op": "<",  "value": 85,   "label": "CPU (%)" },
    { "metric": "pod_restarts",        "op": "<=", "value": 0,    "label": "Pod restarts" }
  ],

  "serverMetrics": {
    "prometheus": { "baseUrl": "https://prom.internal", "tokenEnv": "PROM_TOKEN" },
    "signalfx":   { "realm": "eu0", "tokenEnv": "SFX_TOKEN" },
    "traces":     { "flavor": "tempo", "baseUrl": "https://tempo.internal", "tokenEnv": "TEMPO_TOKEN" }
  },

  "ai": { "provider": "openai", "model": "gpt-4o-mini", "apiKeyEnv": "OPENAI_API_KEY" }
}
```

Every backend is **optional**. A missing exporter degrades the report, it never
fails the run — unavailable SLA metrics are reported as `UNKNOWN`.

### Supported AI providers

- `openai` — any OpenAI-compatible Chat Completions endpoint
  (OpenAI, Azure OpenAI, Ollama, vLLM… set `ai.baseUrl`)
- `anthropic` — Claude

Without an API key, or with `--offline`, a deterministic narrative is rendered
from the correlated findings. **CI never breaks on a missing key.**

## What the correlation engine checks

| Rule | Signal it catches |
| --- | --- |
| client p95 ≫ server p95 | network / ingress / queueing / saturated load generator |
| CPU throttling > 10% | limits set too low — latency spikes with "low" CPU |
| CPU > 85% | compute-bound; check HPA ceiling |
| GC pause > 15% of p95 | allocation churn / heap sizing |
| heap > 85% | memory ceiling, OOM risk |
| event-loop lag > 50 ms | blocking sync work in Node.js |
| DB p95 > 40% of server p95 | missing index, N+1, lock contention |
| downstream p95 > 40% | a dependency is the bottleneck |
| pool saturation > 80% | connection-pool exhaustion |
| pod restarts > 0 | OOMKill / liveness failure — run is untrustworthy |
| client errors ≫ server 5xx | timeouts / resets / ingress rejection |

Each finding carries **evidence → hypothesis → action**, so the report is
reviewable rather than a black box.

## Use it in CI

```yaml
- name: Run load test
  run: k6 run --summary-export=summary.json tests/k6/getEntityByCode/load-test.js

- name: Generate AI performance report
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    PROM_TOKEN:     ${{ secrets.PROM_TOKEN }}
    SFX_TOKEN:      ${{ secrets.SFX_TOKEN }}
  run: |
    node tools/perf-ai-report/index.mjs \
      --config perf/report-config.json \
      --k6 summary.json \
      --out REPORT.md \
      --fail-on-gate

- name: Publish report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: performance-report
    path: REPORT.md
```

The report is automatically appended to `$GITHUB_STEP_SUMMARY`, so it shows up
on the workflow run page with no extra steps.

## Design principles

1. **The gate is deterministic.** Thresholds decide PASS/FAIL. The AI explains
   and prioritises — it is explicitly instructed never to contradict the verdict.
2. **Evidence before prose.** Findings are generated by rules with cited
   numbers; the LLM only turns them into readable analysis.
3. **Degrade, never fail.** Any missing backend or metric is reported as
   unavailable instead of crashing the pipeline.
4. **Portable.** Plain Node 18+, zero dependencies.
