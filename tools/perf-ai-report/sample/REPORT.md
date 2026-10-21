# Performance Report — entity-api

> **Verdict: ❌ FAIL**  ·  dev-euwe  ·  load-test.js

| Run | Value |
| --- | --- |
| Environment | dev-euwe |
| Service | entity-api |
| Test script | load-test.js |
| Virtual users | 50 |
| Ramp-up / Duration | 2m / 10m |
| Window | 2026-10-21T09:42:58.738Z → 2026-10-21T09:54:58.738Z |

## SLA gate (deterministic)

| Metric | Actual | SLA | Result |
| --- | --- | --- | --- |
| Client p95 latency (ms) | 1042.6 (+30.3%) | < 800 | ❌ FAIL |
| Client p99 latency (ms) | 2310.9 (+54.1%) | < 1500 | ❌ FAIL |
| Error rate | 0.0243 (+143%) | < 0.01 | ❌ FAIL |
| Throughput (req/s) | 238.7 (+19.3%) | > 200 | ✅ PASS |
| Server-side p95 (ms) | 934 (+55.7%) | < 600 | ❌ FAIL |
| CPU utilisation (%) | 91.4 (+7.5%) | < 85 | ❌ FAIL |
| Pod restarts | 1 | <= 0 | ❌ FAIL |

## Client-side vs server-side

| Signal | Client (k6) | Server (OTel / SignalFx) |
| --- | --- | --- |
| p95 latency | 1042.6 ms | 934 ms |
| p99 latency | 2310.9 ms | 2105 ms |
| Throughput | 238.7 req/s | 236.2 req/s |
| Error rate | 2.43% | 2.29% |

## Server-side resource &amp; runtime

| Metric | Value |
| --- | --- |
| CPU utilisation | 91.4 % |
| CPU throttling | 27.8 % |
| Memory working set | 1740 MB |
| Heap used | 88.3 % |
| GC pause p95 | 186 ms |
| DB p95 | 601 ms |
| Downstream HTTP p95 | 120 ms |
| Connection pool saturation | 94 % |
| Max ready pods | 2 |
| Pod restarts | 1 |

## Hottest operations (traces)

| Operation | Count | p95 | Max | Total |
| --- | --- | --- | --- | --- |
| `db.query.getEntityByCode` | 1820 | 601 ms | 1890 ms | 731822 ms |
| `http.client.pricing-service` | 1820 | 120 ms | 430 ms | 175448 ms |
| `cache.lookup` | 1820 | 19 ms | 88 ms | 22204 ms |

## Correlated findings

### 🔴 Container CPU throttling detected
- **Evidence:** CPU was throttled 27.8% of scheduling periods during the test.
- **Hypothesis:** CPU limits are set too close to actual demand, so the kernel is pausing the workload — this shows up as latency spikes rather than high CPU.
- **Action:** Raise the CPU limit (or remove it and rely on requests), then re-run. Throttling above ~10% almost always explains p99 outliers.

### 🔴 CPU saturation on the system under test
- **Evidence:** Average CPU utilisation reached 91.4%.
- **Hypothesis:** The service is compute-bound at this load level.
- **Action:** Confirm the HPA scaled as expected; if it hit max replicas, raise the ceiling or profile hot code paths.

### 🔴 GC pauses are a significant share of response time
- **Evidence:** GC pause p95 186 ms against request p95 1042.6 ms (17.8%).
- **Hypothesis:** Allocation rate or heap sizing is causing frequent/long collections that stall request threads.
- **Action:** Capture a heap dump and GC log for this window; review heap sizing and object churn on the hot path.

### 🔴 Database time dominates the request
- **Evidence:** DB p95 601 ms is 64.3% of server p95 934 ms.
- **Hypothesis:** Missing index, N+1 query pattern, or lock contention under concurrency.
- **Action:** Pull the slowest statements for this window and check execution plans; verify indexes on the hot predicate.

### 🔴 Connection pool near exhaustion
- **Evidence:** Pool utilisation peaked at 94%.
- **Hypothesis:** Requests are queueing for a connection — latency rises sharply while CPU stays low.
- **Action:** Increase pool size or reduce per-request hold time; re-test to confirm the knee moves.

### 🔴 Pods restarted during the test
- **Evidence:** 1 container restart(s) in the test window.
- **Hypothesis:** OOMKill or a failing liveness probe under load — results after the first restart are not trustworthy.
- **Action:** Check exit codes and memory limits; treat this run as invalid for capacity conclusions until it is stable.

### 🟠 Heap pressure
- **Evidence:** Peak heap utilisation 88.3%.
- **Hypothesis:** The workload is close to its memory ceiling; risk of long GC or OOM at higher load.
- **Action:** Increase heap/memory limits or reduce retained objects before scaling the test up.

### 🟠 Elevated error rate
- **Evidence:** Client error rate 2.43%, server-side 5xx rate 2.29%.
- **Hypothesis:** The service is actively returning failures under this load.
- **Action:** Inspect status-code breakdown and the first failing timestamp relative to the ramp-up.

### 🟠 Hottest operation: db.query.getEntityByCode
- **Evidence:** db.query.getEntityByCode — p95 601 ms, max 1890 ms across 1820 sampled spans.
- **Hypothesis:** This operation contributed the most total time during the window.
- **Action:** Start root-cause analysis here before looking anywhere else.

### 🔵 Latency originates inside the application
- **Evidence:** Client p95 1042.6 ms closely tracks server p95 934 ms (gap 10.4%).
- **Hypothesis:** The service's own processing dominates response time.
- **Action:** Focus tuning on in-process work: downstream calls, DB, serialization, GC.

### 🔵 Throughput and scaling summary
- **Evidence:** 238.7 req/s sustained with 50 VUs across up to 2 ready pod(s).
- **Hypothesis:** Baseline for comparing future runs at the same load profile.
- **Action:** Track req/s per pod over time; a drop at equal load is an early regression signal.

---

# AI analysis

## Executive summary

The run completed with a **FAIL** verdict against 7 SLA check(s) (1 passed, 6 failed, 0 unavailable). Client-observed p95 was 1042.6 ms at 238.7 req/s with an error rate of 2.43%. The dominant issue is: **Container CPU throttling detected**.

## What the data shows

- Client-side (k6): p95 1042.6 ms, p99 2310.9 ms, throughput 238.7 req/s, errors 2.43%.
- Server-side: service p95 934 ms, CPU 91.4 %, throttling 27.8 %, restarts 1.
- Dependencies: DB p95 601 ms, downstream HTTP p95 120 ms.

## Most likely root cause

**Container CPU throttling detected** — CPU was throttled 27.8% of scheduling periods during the test. CPU limits are set too close to actual demand, so the kernel is pausing the workload — this shows up as latency spikes rather than high CPU.

## Recommended actions

1. **Container CPU throttling detected** — Raise the CPU limit (or remove it and rely on requests), then re-run. Throttling above ~10% almost always explains p99 outliers.
2. **CPU saturation on the system under test** — Confirm the HPA scaled as expected; if it hit max replicas, raise the ceiling or profile hot code paths.
3. **GC pauses are a significant share of response time** — Capture a heap dump and GC log for this window; review heap sizing and object churn on the hot path.
4. **Database time dominates the request** — Pull the slowest statements for this window and check execution plans; verify indexes on the hot predicate.
5. **Connection pool near exhaustion** — Increase pool size or reduce per-request hold time; re-test to confirm the knee moves.

## Confidence & gaps

All configured SLA metrics were available for the full test window.

---

<sub>Generated by `perf-ai-report` · verdict decided by deterministic SLA thresholds; AI used for explanation only.</sub>