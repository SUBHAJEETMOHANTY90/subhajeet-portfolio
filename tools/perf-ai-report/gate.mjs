/**
 * Deterministic SLA gate.
 *
 * This — not the AI — decides PASS/FAIL. The LLM only explains the result.
 * Keeping the verdict deterministic makes the gate auditable and repeatable.
 */

const OPS = {
  "<": (a, b) => a < b,
  "<=": (a, b) => a <= b,
  ">": (a, b) => a > b,
  ">=": (a, b) => a >= b,
};

/**
 * @param {object} metrics  flat map of metricName -> number
 * @param {object[]} slas   [{ metric, op, value, label? }]
 */
export function evaluateGate(metrics, slas = []) {
  const checks = slas.map((sla) => {
    const actual = metrics[sla.metric];
    const op = OPS[sla.op] ?? OPS["<"];

    if (actual === null || actual === undefined) {
      return {
        ...sla,
        actual: null,
        status: "UNKNOWN",
        detail: `metric "${sla.metric}" was not available`,
      };
    }

    const ok = op(Number(actual), Number(sla.value));
    const deltaPct =
      Number(sla.value) === 0
        ? null
        : round(((Number(actual) - Number(sla.value)) / Number(sla.value)) * 100);

    return {
      ...sla,
      actual: Number(actual),
      status: ok ? "PASS" : "FAIL",
      deltaPct,
      detail: `${sla.metric} = ${actual} (SLA ${sla.op} ${sla.value})`,
    };
  });

  const failed = checks.filter((c) => c.status === "FAIL");
  const unknown = checks.filter((c) => c.status === "UNKNOWN");

  return {
    verdict: failed.length ? "FAIL" : "PASS",
    passed: checks.filter((c) => c.status === "PASS").length,
    failed: failed.length,
    unknown: unknown.length,
    checks,
  };
}

function round(v, digits = 1) {
  const f = 10 ** digits;
  return Math.round(Number(v) * f) / f;
}
