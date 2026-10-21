#!/usr/bin/env node
/**
 * perf-ai-report — turn a load test into a decision.
 *
 *   k6 results  ─┐
 *   Prometheus  ─┼─► correlate ─► deterministic SLA gate ─► AI narrative ─► Markdown
 *   SignalFx    ─┤
 *   Traces      ─┘
 *
 * Usage:
 *   node index.mjs --config config.json --k6 summary.json --out REPORT.md
 *   node index.mjs --config sample/config.json --k6 sample/k6-summary.json --offline
 */
import { readFile, writeFile, appendFile } from "node:fs/promises";
import { collectK6 } from "./collectors/k6.mjs";
import { collectPrometheus } from "./collectors/prometheus.mjs";
import { collectSignalFx } from "./collectors/signalfx.mjs";
import { collectTraces } from "./collectors/traces.mjs";
import { evaluateGate } from "./gate.mjs";
import { correlate } from "./correlate.mjs";
import { analyze } from "./analyze.mjs";
import { renderReport } from "./report.mjs";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) args[key] = true;
    else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`perf-ai-report
  --config <file>   JSON config (service, namespace, slas, backends)
  --k6 <file>       k6 summary JSON (--summary-export)
  --out <file>      write the Markdown report here
  --offline         skip the LLM call, use deterministic narrative
  --fail-on-gate    exit 1 when the SLA gate fails (use in CI)`);
    return;
  }

  const cfg = JSON.parse(await readFile(args.config ?? "config.json", "utf8"));

  // ---- 1. Client-side ------------------------------------------------
  const k6 = await collectK6(args.k6 ?? cfg.k6Summary ?? "summary.json");

  const stopMs = Date.now();
  const startMs = stopMs - durationToMs(cfg.run?.duration ?? "10m") - durationToMs(cfg.run?.rampUp ?? "0s");

  // ---- 2. Server-side (all optional, failures degrade gracefully) ----
  let server = { source: "none", metrics: {} };
  let traces = { topSpans: [] };

  const prom = cfg.serverMetrics?.prometheus;
  if (prom?.baseUrl) {
    const p = await collectPrometheus({
      baseUrl: prom.baseUrl,
      token: envOr(prom.tokenEnv),
      service: cfg.service,
      namespace: cfg.namespace,
      window: cfg.run?.duration ?? "10m",
      queries: prom.queries,
    });
    server = { ...p, metrics: { ...server.metrics, ...p.metrics } };
  }

  const sfx = cfg.serverMetrics?.signalfx;
  if (sfx?.realm && envOr(sfx.tokenEnv)) {
    const f = await collectSignalFx({
      realm: sfx.realm,
      token: envOr(sfx.tokenEnv),
      service: cfg.service,
      namespace: cfg.namespace,
      startMs,
      stopMs,
      programs: sfx.programs,
    });
    // Prometheus wins on conflicts; SignalFx fills the gaps.
    server = {
      source: [server.source, "signalfx"].filter((x) => x !== "none").join("+"),
      metrics: { ...f.metrics, ...server.metrics },
    };
  }

  const tr = cfg.serverMetrics?.traces;
  if (tr?.baseUrl) {
    traces = await collectTraces({
      flavor: tr.flavor ?? "tempo",
      baseUrl: tr.baseUrl,
      token: envOr(tr.tokenEnv),
      service: cfg.service,
      startMs,
      stopMs,
    });
  }

  // Offline/demo escape hatch: lets you exercise the full pipeline without
  // live backends (handy for testing the gate and correlation rules).
  if (cfg.serverMetrics?.mock) {
    server = {
      source: server.source === "none" ? "mock" : `${server.source}+mock`,
      metrics: { ...cfg.serverMetrics.mock.metrics, ...server.metrics },
    };
    if (!traces.topSpans?.length && cfg.serverMetrics.mock.topSpans) {
      traces = { source: "mock", topSpans: cfg.serverMetrics.mock.topSpans };
    }
  }

  // ---- 3. Deterministic gate over BOTH client and server metrics -----
  const allMetrics = { ...k6.metrics, ...server.metrics };
  const gate = evaluateGate(allMetrics, cfg.slas ?? []);

  // ---- 4. Correlate --------------------------------------------------
  const findings = correlate({ k6, server, traces });

  // ---- 5. AI narrative ------------------------------------------------
  const payload = {
    run: { ...cfg.run, service: cfg.service, environment: cfg.environment },
    gate,
    k6,
    server,
    traces: { topSpans: traces.topSpans?.slice(0, 5) ?? [] },
    findings,
  };

  const narrative = await analyze({
    payload,
    provider: cfg.ai?.provider ?? "openai",
    model: cfg.ai?.model,
    baseUrl: cfg.ai?.baseUrl,
    apiKey: envOr(cfg.ai?.apiKeyEnv ?? "OPENAI_API_KEY"),
    offline: Boolean(args.offline),
  });

  // ---- 6. Render ------------------------------------------------------
  const md = renderReport({
    meta: {
      service: cfg.service,
      environment: cfg.environment,
      testScript: cfg.run?.testScript ?? "load-test.js",
      vus: cfg.run?.vus,
      rampUp: cfg.run?.rampUp,
      duration: cfg.run?.duration,
      start: new Date(startMs).toISOString(),
      end: new Date(stopMs).toISOString(),
    },
    gate,
    k6,
    server,
    traces,
    findings,
    narrative,
  });

  const outFile = args.out ?? cfg.out ?? "REPORT.md";
  await writeFile(outFile, md, "utf8");
  console.log(md);
  console.error(`\n[perf-ai-report] verdict=${gate.verdict} written to ${outFile}`);

  // Surface it in the GitHub Actions run summary when available.
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, md + "\n", "utf8");
  }

  if (args["fail-on-gate"] && gate.verdict === "FAIL") process.exit(1);
}

function envOr(name) {
  return name ? process.env[name] : undefined;
}

function durationToMs(d) {
  const m = String(d).match(/^(\d+(?:\.\d+)?)(ms|s|m|h)$/);
  if (!m) return 0;
  const n = Number(m[1]);
  return { ms: 1, s: 1000, m: 60000, h: 3600000 }[m[2]] * n;
}

main().catch((err) => {
  console.error("[perf-ai-report] failed:", err);
  process.exit(1);
});
