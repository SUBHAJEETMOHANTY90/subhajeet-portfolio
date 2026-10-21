/**
 * AI analysis layer.
 *
 * IMPORTANT: the PASS/FAIL verdict is already decided by gate.mjs. The model is
 * given that verdict plus the correlated findings and asked to *explain and
 * prioritise* — never to re-judge. That keeps the gate deterministic while
 * still producing a readable, human-quality narrative.
 *
 * Supports any OpenAI-compatible Chat Completions endpoint (OpenAI, Azure
 * OpenAI, Ollama, vLLM...) and Anthropic. With `--offline` it falls back to a
 * deterministic, template-rendered narrative so CI never breaks on a missing
 * API key.
 */

const SYSTEM_PROMPT = `You are a senior performance engineer writing a release-readiness report.

Rules:
- The PASS/FAIL verdict is already decided by deterministic SLA thresholds. Never contradict it.
- Use ONLY the data provided. If evidence is missing or ambiguous, say so explicitly.
- Correlate client-side (k6) numbers with server-side metrics and traces.
- Be specific and quantitative. No marketing language, no hedging filler.
- Prioritise: lead with the single most likely bottleneck.

Produce these sections in Markdown:
## Executive summary        (3-4 sentences a release manager can act on)
## What the data shows      (client vs server correlation, with numbers)
## Most likely root cause   (name the component; cite the evidence)
## Recommended actions      (ordered, concrete, each tied to a finding)
## Confidence & gaps        (what would make this conclusion stronger)`;

export async function analyze({ payload, provider, model, apiKey, baseUrl, offline }) {
  if (offline || !apiKey) return offlineNarrative(payload);

  const userContent = JSON.stringify(payload, null, 2);

  try {
    if (provider === "anthropic") {
      return await callAnthropic({ apiKey, model, userContent });
    }
    return await callOpenAICompatible({ apiKey, model, baseUrl, userContent });
  } catch (err) {
    return `${offlineNarrative(payload)}\n\n> AI narrative unavailable (${err.message}); deterministic analysis shown instead.`;
  }
}

async function callOpenAICompatible({ apiKey, model, baseUrl, userContent }) {
  const url = `${(baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "")}/chat/completions`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model ?? "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${await res.text()}`);
  const body = await res.json();
  return body.choices?.[0]?.message?.content?.trim() ?? "";
}

async function callAnthropic({ apiKey, model, userContent }) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: model ?? "claude-sonnet-4-20250514",
      max_tokens: 1500,
      temperature: 0.2,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const body = await res.json();
  return body.content?.map((c) => c.text).join("").trim() ?? "";
}

/**
 * Deterministic fallback: renders the correlated findings as prose.
 * This is what runs in CI when no API key is configured.
 */
function offlineNarrative({ gate, findings = [], k6 = {}, server = {} }) {
  const high = findings.filter((f) => f.severity === "HIGH");
  const lead = high[0] ?? findings[0];
  const c = k6.metrics ?? {};
  const s = server.metrics ?? {};

  const lines = [];

  lines.push("## Executive summary", "");
  lines.push(
    `The run completed with a **${gate.verdict}** verdict against ${gate.checks.length} SLA check(s) ` +
      `(${gate.passed} passed, ${gate.failed} failed, ${gate.unknown} unavailable). ` +
      `Client-observed p95 was ${fmt(c.p95_ms, "ms")} at ${fmt(c.tps, "req/s")} with an error rate of ${pct(c.error_rate)}.` +
      (lead ? ` The dominant issue is: **${lead.title}**.` : " No high-severity issues were detected.")
  );
  lines.push("");

  lines.push("## What the data shows", "");
  lines.push(
    `- Client-side (k6): p95 ${fmt(c.p95_ms, "ms")}, p99 ${fmt(c.p99_ms, "ms")}, throughput ${fmt(c.tps, "req/s")}, errors ${pct(c.error_rate)}.`
  );
  lines.push(
    `- Server-side: service p95 ${fmt(s.server_p95_ms, "ms")}, CPU ${fmt(s.cpu_utilization_pct, "%")}, throttling ${fmt(s.cpu_throttle_pct, "%")}, restarts ${fmt(s.pod_restarts)}.`
  );
  if (s.db_p95_ms != null) lines.push(`- Dependencies: DB p95 ${fmt(s.db_p95_ms, "ms")}, downstream HTTP p95 ${fmt(s.downstream_p95_ms, "ms")}.`);
  lines.push("");

  lines.push("## Most likely root cause", "");
  lines.push(lead ? `**${lead.title}** — ${lead.evidence} ${lead.hypothesis}` : "No single dominant bottleneck was identified from the available signals.");
  lines.push("");

  lines.push("## Recommended actions", "");
  const actions = findings.filter((f) => f.severity !== "INFO").slice(0, 5);
  if (actions.length) actions.forEach((f, i) => lines.push(`${i + 1}. **${f.title}** — ${f.action}`));
  else lines.push("1. No corrective action required; capture this run as the new baseline.");
  lines.push("");

  lines.push("## Confidence & gaps", "");
  const missing = gate.checks.filter((c2) => c2.status === "UNKNOWN").map((c2) => c2.metric);
  lines.push(
    missing.length
      ? `Some metrics were unavailable (${missing.join(", ")}), which lowers confidence. Ensure the exporters are scraping during the test window.`
      : "All configured SLA metrics were available for the full test window."
  );

  return lines.join("\n");
}

const fmt = (v, unit = "") => (v === null || v === undefined ? "n/a" : `${v}${unit ? " " + unit : ""}`);
const pct = (v) => (v === null || v === undefined ? "n/a" : `${(Number(v) * 100).toFixed(2)}%`);
