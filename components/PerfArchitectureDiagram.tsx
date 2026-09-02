"use client";

/**
 * A lightweight, dependency-free architecture diagram (boxes + arrows) rendered
 * with styled divs and inline SVG connectors. Responsive and theme-aware.
 */

function Box({
  title,
  subtitle,
  tone = "slate",
  className = "",
}: {
  title: string;
  subtitle?: string;
  tone?: "slate" | "primary" | "accent" | "amber" | "emerald";
  className?: string;
}) {
  const tones: Record<string, string> = {
    slate:
      "border-slate-300 bg-slate-50 text-slate-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-100",
    primary:
      "border-primary/40 bg-primary/10 text-primary dark:border-primary/40 dark:bg-primary/15",
    accent:
      "border-accent/40 bg-accent/10 text-accent dark:border-accent/40 dark:bg-accent/15",
    amber:
      "border-amber-400/50 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300",
    emerald:
      "border-emerald-400/50 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-300",
  };
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-center shadow-sm ${tones[tone]} ${className}`}
    >
      <p className="text-sm font-semibold leading-tight">{title}</p>
      {subtitle && (
        <p className="mt-1 text-xs font-normal opacity-80">{subtitle}</p>
      )}
    </div>
  );
}

function ArrowDown({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      {label && (
        <span className="mb-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-400">
          {label}
        </span>
      )}
      <svg width="20" height="26" viewBox="0 0 20 26" className="text-slate-400 dark:text-white/30">
        <line x1="10" y1="0" x2="10" y2="20" stroke="currentColor" strokeWidth="2" />
        <polygon points="4,18 16,18 10,26" fill="currentColor" />
      </svg>
    </div>
  );
}

function Lane({
  label,
  children,
  tone = "slate",
}: {
  label: string;
  children: React.ReactNode;
  tone?: "slate" | "primary" | "accent";
}) {
  const ring: Record<string, string> = {
    slate: "border-slate-200 dark:border-white/10",
    primary: "border-primary/30",
    accent: "border-accent/30",
  };
  return (
    <div className={`rounded-2xl border border-dashed p-4 ${ring[tone]}`}>
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      {children}
    </div>
  );
}

export function PerfArchitectureDiagram() {
  return (
    <div className="mt-6 space-y-2">
      {/* Lane 1: Trigger */}
      <Lane label="① GitHub · Repo A (your product repo)" tone="primary">
        <Box
          tone="primary"
          title="workflow_dispatch — Run workflow"
          subtitle="inputs: environment-region · test-script · VUs · ramp-up · duration · think-time"
        />
        <ArrowDown label="uses: Repo-B/workflow.yml@v0" />
      </Lane>

      {/* Lane 2: Reusable workflow on runner */}
      <Lane label="② Reusable workflow (Repo B) · ephemeral ubuntu runner" tone="accent">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Box title="Checkout Repo A" subtitle="get tests/k6 scripts" />
          <Box title="Load .env" subtitle="ARM_CLIENT_ID · AKS_REGION · AKS_TIER · AKS_NAMESPACE" />
          <Box title="Cluster login" subtitle="OIDC federated identity" tone="amber" />
          <Box title="Merge data" subtitle="knobs + K6_SECRETS → 1 JSON" />
        </div>
        <ArrowDown label="runner action deploys the pod" />
        <Box
          tone="accent"
          title="Runner action → deploy k6 into AKS_NAMESPACE"
          subtitle="mode A: aks-k6 (1 pod)   ·   mode B: aks-k6-operator (k6 Operator + N agents)"
        />
      </Lane>

      {/* Lane 3: Cluster */}
      <Lane label="③ Kubernetes cluster · your namespace" tone="slate">
        <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
          <Box
            tone="emerald"
            title="k6 Pod(s)"
            subtitle="test-script + main.js → action.js"
          />
          <div className="flex flex-col items-center text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <span>load (same-ns)</span>
            <svg width="60" height="24" viewBox="0 0 60 24" className="text-slate-400 dark:text-white/30">
              <line x1="0" y1="8" x2="52" y2="8" stroke="currentColor" strokeWidth="2" />
              <polygon points="52,3 52,13 60,8" fill="currentColor" />
              <line x1="8" y1="18" x2="60" y2="18" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
              <polygon points="8,13 8,23 0,18" fill="currentColor" />
            </svg>
            <span>responses</span>
          </div>
          <Box
            title="k8s Service → App pods"
            subtitle="system under test · scales via HPA on CPU"
          />
        </div>

        <ArrowDown label="streams metrics (--out influxdb)" />

        <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
          <Box
            title="InfluxDB service"
            subtitle="<svc>.<ns>:8086/loadtest"
          />
          <div className="flex items-center justify-center text-slate-400 dark:text-white/30">
            <svg width="60" height="16" viewBox="0 0 60 16">
              <line x1="0" y1="8" x2="52" y2="8" stroke="currentColor" strokeWidth="2" />
              <polygon points="52,3 52,13 60,8" fill="currentColor" />
            </svg>
          </div>
          <Box
            tone="primary"
            title="Grafana dashboards"
            subtitle="p95 · TPS · errors · VUs (live + historical)"
          />
        </div>
      </Lane>

      {/* Identity provider */}
      <Lane label="Auth (called from action.js / bearer.js)" tone="slate">
        <Box
          tone="amber"
          title="Identity provider — OAuth2 token endpoint"
          subtitle="client_credentials → JWT · refreshed 60s before expiry"
        />
      </Lane>
    </div>
  );
}
