import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { PerfArchitectureDiagram } from "@/components/PerfArchitectureDiagram";
import {
  FolderTree,
  Sliders,
  Database,
  KeyRound,
  Activity,
  Rocket,
  GitBranch,
  Gauge,
  CheckCircle2,
  Workflow,
  Boxes,
  ListChecks,
  Sparkles,
  BrainCircuit,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Performance Test Template",
  description:
    "A reusable, copy-pasteable k6 + CI performance testing template. Follow the steps to set up your own reusable load-test framework with data-driven scripts, auth handling, staged load models and parameterized CI runs.",
};

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-relaxed text-slate-100 dark:bg-black/60">
      <code>{children}</code>
    </pre>
  );
}

const dollar = "$";

export default function PerfTemplatePage() {
  return (
    <>
      <PageHeader
        eyebrow="Reusable Blueprint"
        title="Build Your Own Performance Test Template"
        subtitle="This is the pattern I use to run repeatable, data-driven load tests. Copy the structure below and you'll have your own reusable performance template — parameterized, CI-ready, and honest enough to gate a release."
      />

      <section className="section space-y-14">
        {/* Intro note */}
        <div className="container-page">
          <Reveal>
            <div className="card border-l-4 border-accent">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>What you&apos;ll build:</strong> a self-contained k6 template where the{" "}
                <em>load model</em>, <em>test data</em>, <em>auth</em> and <em>environment</em>{" "}
                are all configuration — so the same scripts run as a 1-user smoke check or a
                thousand-user load test just by changing inputs. Everything below is generic;
                swap in your own endpoints and data.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Step 1 - structure */}
        <div className="container-page">
          <Reveal>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-primary">
              <FolderTree className="h-6 w-6 text-accent" /> 1. Lay out the folder structure
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Separate the <strong>scenario</strong>, the <strong>load shape</strong>, the{" "}
              <strong>data</strong>, and the <strong>config</strong>. This is what makes it a
              template instead of a one-off script.
            </p>
            <Code>{`perf/
├─ scenarios/
│  └─ getEntityByCode/
│     ├─ main.js          # one iteration = one business action
│     ├─ action.js        # the actual HTTP request(s) + checks
│     ├─ bearer.js        # token fetch/refresh helper
│     ├─ smoke-test.js    # 1 VU, quick "does it work"
│     ├─ sanity-test.js   # low load, correctness under light traffic
│     ├─ load-test.js     # full staged load model
│     └─ data/
│        └─ entities.csv  # realistic, data-driven inputs
└─ config/
   └─ globalHeaders.js    # shared headers, common vars`}</Code>
          </Reveal>
        </div>

        {/* Call chain / entry point */}
        <div className="container-page">
          <Reveal>
            <div className="card border-l-4 border-primary">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-primary">
                <Workflow className="h-6 w-6 text-accent" /> The call chain — what starts what
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                The <strong>entry point is the CI workflow</strong>, not a script you run by
                hand. It launches a reusable in-cluster k6 runner, which executes the chosen{" "}
                <em>test-script</em>. From there each file has one job — this is the exact
                order things call each other:
              </p>
              <Code>{`CI workflow  (workflow_dispatch: env, script, VUs, ramp-up, duration, think-time)
   │  loads env + logs into the cluster, passes CUSTOM_DATA_OBJECT (JSON of knobs)
   ▼
Reusable k6 runner (runs INSIDE the cluster, next to the app)
   │  runs the selected test-script with test-path + test-script inputs
   ▼
<test-script>.js          ← THE k6 ENTRY POINT
   │  export const options = { ...load model / stages / thresholds... }
   │  export default function () { main(csvData) }
   ▼
main.js                    (one iteration = one business action)
   │  1. parse CUSTOM_DATA_OBJECT   2. pick a random CSV row (SharedArray)
   │  3. refresh bearer if expired  4. call action()   5. sleep(think-time)
   ├──────────────► bearer.js   http.post → identity provider (client_credentials)
   │                            returns { token, expires }
   └──────────────► action.js   http.get → target API (subscription key + bearer)
                                check(status < 400) else fail()
   ▼
Results streamed to a time-series DB (InfluxDB) → dashboards (Grafana)`}</Code>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                <strong>Key idea:</strong> the <em>load model</em> lives in each{" "}
                <code>test-script</code>&apos;s <code>options</code>, while the{" "}
                <em>business action</em> lives once in <code>main.js</code> + <code>action.js</code>.
                Swap the script to change the shape of the load; the request logic never changes.
              </p>
            </div>
          </Reveal>
        </div>


        {/* Step 2 - config */}
        <div className="container-page">
          <Reveal>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Sliders className="h-6 w-6 text-accent" /> 2. Make everything configuration
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Pass one JSON object of inputs through an environment variable. Now the same
              template scales from smoke to peak without editing code.
            </p>
            <Code>{`// read all knobs from a single env-provided JSON blob
const {
  VUS,          // virtual users (concurrency)
  RAMPUP,       // e.g. "1m"
  DURATION,     // steady-state hold, e.g. "10m"
  SLEEP,        // think-time between iterations (seconds)
  CLIENT_ID,
  CLIENT_SECRET,
  SUBSCRIPTION_KEY,
} = JSON.parse(__ENV.CUSTOM_DATA_OBJECT)`}</Code>
          </Reveal>
        </div>

        {/* Step 3 - data driven */}
        <div className="container-page">
          <Reveal>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Database className="h-6 w-6 text-accent" /> 3. Drive it with realistic data
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Load a CSV once into a shared in-memory array so every virtual user hits a
              different, valid record — no caching a single hot key and calling it a load test.
            </p>
            <Code>{`import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js'
import { SharedArray } from 'k6/data'

// parsed ONCE, shared across all VUs (memory-efficient)
const entities = new SharedArray('entities', () =>
  papaparse.parse(open('./data/entities.csv'), { header: true }).data
)

const rndInt = (arr) => Math.floor(Math.random() * arr.length)

export default function () {
  const row = entities[rndInt(entities)]   // pick a random valid record
  main(row)
}`}</Code>
          </Reveal>
        </div>

        {/* Step 4 - auth */}
        <div className="container-page">
          <Reveal>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-primary">
              <KeyRound className="h-6 w-6 text-accent" /> 4. Handle auth so soak tests don&apos;t die
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Fetch an OAuth2 client-credentials token and refresh it{" "}
              <strong>before</strong> it expires. Refreshing ~60s early is the difference
              between a clean 2-hour soak and a wall of 401s.
            </p>
            <Code>{`let expiresAt = 0
let bearer = {}

export const main = (row) => {
  const now = Math.floor(Date.now() / 1000)
  if (now >= expiresAt) {
    bearer = fetchBearer(CLIENT_ID, CLIENT_SECRET, scope)
    expiresAt = now + bearer.expires - 60   // refresh 60s early
  }
  action(SUBSCRIPTION_KEY, bearer.token, row.code, row.country)
  sleep(SLEEP)   // think-time keeps the model realistic
}`}</Code>
          </Reveal>
        </div>

        {/* Step 5 - load model */}
        <div className="container-page">
          <Reveal>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Activity className="h-6 w-6 text-accent" /> 5. Shape the load in stages
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Ramp up gradually, hold steady, then ramp down. Add thresholds so the test{" "}
              <em>fails itself</em> when SLAs are breached — that&apos;s what makes it a gate.
            </p>
            <Code>{`import { main } from './main.js'

const RAMPDOWN = Math.floor(parseFloat(RAMPUP) / 3).toString()

export const options = {
  stages: [
    { duration: RAMPUP,           target: VUS },  // ramp up
    { duration: DURATION,         target: VUS },  // hold steady
    { duration: \`${dollar}{RAMPDOWN}s\`, target: 0   },  // ramp down
  ],
  thresholds: {
    http_req_failed:   ['rate<0.01'],   // <1% errors
    http_req_duration: ['p(95)<800'],   // 95th percentile under 800ms
  },
  tags: { script: 'getEntityByCode-load-test' },
}`}</Code>
          </Reveal>
        </div>

        {/* Step 6 - test types */}
        <div className="container-page">
          <Reveal>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-primary">
              <CheckCircle2 className="h-6 w-6 text-accent" /> 6. Reuse one action, many test types
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Smoke, sanity and load all call the same <code>main()</code> — only the load
              options differ. Write the business logic once.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {[
                { t: "smoke-test.js", d: "1 VU, ~30s. Fast 'did I break the request?' check on every PR." },
                { t: "sanity-test.js", d: "Low, steady load. Confirms correctness and stability under light traffic." },
                { t: "load-test.js", d: "Full staged model at target VUs. The real capacity / SLA validation." },
              ].map((x) => (
                <div key={x.t} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                  <p className="font-mono text-sm font-semibold text-accent">{x.t}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{x.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Step 7 - run locally */}
        <div className="container-page">
          <Reveal>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Rocket className="h-6 w-6 text-accent" /> 7. Run it locally
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Everything is an input, so a local run is just one command with your config blob.
            </p>
            <Code>{`# install k6: https://k6.io/docs/get-started/installation

# smoke
k6 run scenarios/getEntityByCode/smoke-test.js \\
  -e CUSTOM_DATA_OBJECT='{"VUS":1,"SLEEP":1,"CLIENT_ID":"...","CLIENT_SECRET":"...","SUBSCRIPTION_KEY":"..."}'

# full load
k6 run scenarios/getEntityByCode/load-test.js \\
  -e CUSTOM_DATA_OBJECT='{"VUS":50,"RAMPUP":"2m","DURATION":"10m","SLEEP":1,"CLIENT_ID":"...","CLIENT_SECRET":"...","SUBSCRIPTION_KEY":"..."}'`}</Code>
          </Reveal>
        </div>

        {/* Step 8 - CI */}
        <div className="container-page">
          <Reveal>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-primary">
              <GitBranch className="h-6 w-6 text-accent" /> 8. Make it on-demand — the two-repo model
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              The clever part: your product repo doesn&apos;t contain the heavy k8s logic. It
              keeps only the <strong>k6 scripts</strong> plus a <strong>thin caller workflow</strong>,
              and it <code>uses:</code> a shared <strong>reusable workflow</strong> that lives
              in a second, central repo. That central repo owns all the cluster orchestration,
              so every team gets the same battle-tested pipeline for free.
            </p>
            <Code>{`Repo A — YOUR PRODUCT REPO                 Repo B — CENTRAL REUSABLE WORKFLOW
────────────────────────────              ─────────────────────────────────────
tests/k6/getEntityByCode/*.js             .github/workflows/workflow.yml
.github/workflows/.dev-euwe.env           .github/workflows/k6-operator.yml
.github/workflows/on-demand-perftest.yml  (owns cluster login + k6 orchestration)
        │
        │  uses: reusable workflow
        ▼
   calls Repo B ───────────────────────▶  runs everything below on your behalf`}</Code>

            <p className="mt-6 text-sm font-semibold text-primary">Repo A — the thin caller (all you write):</p>
            <Code>{`name: On-demand performance test
on:
  workflow_dispatch:
    inputs:
      environment-region: { type: choice, options: [dev-euwe, acc-euwe], default: dev-euwe }
      test-script:        { type: choice, options: [smoke-test.js, sanity-test.js, load-test.js] }
      virtual-users:      { type: string, default: "1" }
      ramp-up:            { type: string, default: "1m" }
      duration:           { type: string, default: "10m" }
      think-time:         { type: string, default: "1" }

jobs:
  perf:
    # 👇 hand off to the central reusable workflow — you inherit the whole pipeline
    uses: your-org/perftest-reusable-workflow/.github/workflows/workflow.yml@v0
    with:
      environment-region: ${dollar}{{ inputs.environment-region }}
      test-script:        ${dollar}{{ inputs.test-script }}
      virtual-users:      ${dollar}{{ inputs.virtual-users }}
      ramp-up:            ${dollar}{{ inputs.ramp-up }}
      duration:           ${dollar}{{ inputs.duration }}
      think-time:         ${dollar}{{ inputs.think-time }}
      # extra per-request data (ids/keys) merged into the k6 data object
      test-custom-data-object: '{"CLIENT_ID":"...","SUBSCRIPTION_KEY":"..."}'
    secrets:
      K6_SECRETS: ${dollar}{{ secrets.K6_SECRETS }}   # JSON blob of secrets for the script`}</Code>

            <p className="mt-6 text-sm font-semibold text-primary">
              Repo B — the reusable workflow (written once, shared by everyone):
            </p>
            <Code>{`on:
  workflow_call:                     # ← this is what makes it reusable
    inputs: { environment-region, test-script, virtual-users, ramp-up, duration, think-time, ... }
    secrets: { K6_SECRETS }

jobs:
  performance-test:
    runs-on: ubuntu-latest
    concurrency: ${dollar}{{ inputs.environment-region }}   # one run per env at a time
    environment: ${dollar}{{ inputs.environment-region }}
    steps:
      - uses: actions/checkout@v6                     # 1. checkout the CALLER's k6 scripts

      - name: Load dotenv                             # 2. read .<env-region>.env →
        uses: your-org/export-dotenv@v0               #    ARM_CLIENT_ID, AKS_REGION,
        with:                                         #    AKS_TIER, AKS_NAMESPACE + secrets
          path: ./.github/workflows/.${dollar}{{ inputs.environment-region }}.env
          secrets: ${dollar}{{ toJSON(secrets) }}

      - name: Cluster login                           # 3. OIDC federated login to the
        uses: your-org/cluster-login@v1               #    cluster (no static creds)
        with:
          client-id:     ${dollar}{{ env.ARM_CLIENT_ID }}
          cluster-group: ${dollar}{{ env.AKS_REGION }}
          cluster-tier:  ${dollar}{{ env.AKS_TIER }}

      - name: Merge custom data                       # 4. fold knobs + secrets into ONE
        run: |                                        #    JSON the k6 script will parse
          echo 'test_custom_data={"VUS":"...","RAMPUP":"...","DURATION":"...","SLEEP":"...","K6_SECRETS":{...}}' >> $GITHUB_OUTPUT

      - name: Run k6 test                             # 5. hand off to the runner action
        uses: your-org/run-k6@v0                      #    which deploys the k6 POD
        with:
          namespace:   ${dollar}{{ env.AKS_NAMESPACE }}
          test-path:   tests/k6
          test-script: ${dollar}{{ inputs.test-script }}
          cpu-limit: "250m"  memory-limit: "1000Mi"
          test-custom-data-object: ${dollar}{{ steps.merge.outputs.test_custom_data }}
          influxdb: "http://influxdb.<cluster-internal>:8086/loadtest"`}</Code>
          </Reveal>
        </div>


        {/* Step 8b - deployment architecture */}
        <div className="container-page">
          <Reveal>
            <div className="card border-l-4 border-primary">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-primary">
                <Boxes className="h-6 w-6 text-accent" /> The complete architecture — request to result
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                The workflow doesn&apos;t just run <code>k6</code> on the CI runner — the CI
                runner is only the <em>conductor</em>. It logs into the cluster and asks a
                runner action to <strong>deploy a k6 pod inside your namespace</strong>, which
                sends traffic <strong>directly to your k8s Service in the same namespace</strong>{" "}
                — bypassing the CDN and ingress so you measure <em>your service</em>, not the
                internet. Here is the full path from a button click to a Grafana dashboard:
              </p>

              {/* Graphical diagram */}
              <PerfArchitectureDiagram />

              {/* Text version (copy-friendly) */}
              <p className="mt-8 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Same flow, as text
              </p>
              <Code>{`┌──────────────────────────────────────────────────────────────────────┐
│  1. TRIGGER  (Repo A — your product repo)                             │
│  Engineer clicks "Run workflow" (workflow_dispatch)                    │
│  → the caller job does: uses: Repo-B/workflow.yml@v0                   │
└───────────────┬──────────────────────────────────────────────────────┘
                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  2. REUSABLE WORKFLOW (Repo B) on an ephemeral ubuntu-latest runner   │
│  a) checkout Repo A (to get its tests/k6 scripts)                     │
│  b) load .<env-region>.env → ARM_CLIENT_ID, AKS_REGION, AKS_TIER,     │
│                              AKS_NAMESPACE  (+ inject secrets)         │
│  c) cluster login via OIDC federated identity (no static creds)       │
│  d) merge knobs + K6_SECRETS → one CUSTOM_DATA_OBJECT JSON            │
└───────────────┬──────────────────────────────────────────────────────┘
                ▼
┌──────────────────────────────────────────────────────────────────────┐
│  3. RUNNER ACTION  →  deploys a k6 POD into AKS_NAMESPACE            │
│  passes: namespace, test-path (tests/k6), test-script,                │
│          CUSTOM_DATA_OBJECT, cpu/mem requests+limits, influxdb URL    │
│  ── mode A: aks-k6         → 1 standalone k6 pod                      │
│  ── mode B: aks-k6-operator→ k6 Operator + N agent pods (distributed) │
└───────────────┬──────────────────────────────────────────────────────┘
                ▼
┌──────────────────── KUBERNETES CLUSTER · YOUR NAMESPACE ─────────────┐
│                                                                       │
│   ┌──────────────┐  load (same-ns)     ┌───────────────────────────┐ │
│   │  k6 POD(s)   │───────────────────▶ │  k8s SERVICE → App pods   │ │
│   │ (test-script │  http.get w/ token  │  (system under test)      │ │
│   │  + main.js)  │◀─────────────────── │  scales via HPA on CPU    │ │
│   └──────┬───────┘  responses          └───────────────────────────┘ │
│          │ streams metrics (--out influxdb)                          │
│          ▼                                                            │
│   ┌──────────────────────────┐        ┌──────────────────────────┐   │
│   │  InfluxDB service         │◀──────▶│  Grafana dashboards      │   │
│   │  <svc>.<ns>:8086/loadtest │  reads │  p95, TPS, errors, VUs   │   │
│   └──────────────────────────┘        └──────────────────────────┘   │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
                ▲
                │ token
   ┌────────────┴─────────────┐
   │  Identity provider        │  bearer.js: client_credentials → JWT
   │  (OAuth2 token endpoint)   │  refreshed 60s before expiry
   └───────────────────────────┘`}</Code>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  {
                    t: "Where is k6 hosted / orchestrated?",
                    d: "Not on the GitHub runner — the runner action deploys k6 as a pod in your product's own namespace. Traffic goes k6 pod → k8s Service → app pods, all inside the same namespace, so you test the service in isolation.",
                  },
                  {
                    t: "One pod vs. many (the operator)",
                    d: "aks-k6 runs a single k6 pod — fine for most tests. For heavy/distributed load, aks-k6-operator uses the k6 Operator: it creates a TestRun custom resource and the controller fans the test out across N agent pods (k6-agents input).",
                  },
                  {
                    t: "How the pod is requested & sized",
                    d: "The action templates the pod/TestRun manifest and applies it to AKS_NAMESPACE with cpu/memory requests + limits (e.g. 250m/1000Mi). Requests get it scheduled; limits stop the load generator itself from becoming the bottleneck.",
                  },
                  {
                    t: "How config reaches the pod",
                    d: "The reusable workflow merges VUs, ramp-up, duration, think-time and K6_SECRETS into ONE CUSTOM_DATA_OBJECT env var. The script parses it at start — same image, any load profile, no rebuild per run.",
                  },
                  {
                    t: "How results get out",
                    d: "k6 runs with --out influxdb pointed at a cluster-internal InfluxDB service on :8086/loadtest. Grafana reads InfluxDB, so every run is a live, historical dashboard — not a console dump.",
                  },
                ].map((x) => (
                  <div key={x.t} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                    <p className="font-semibold text-primary">{x.t}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{x.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Setup from scratch */}
        <div className="container-page">
          <Reveal>
            <div className="card">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-primary">
                <ListChecks className="h-6 w-6 text-accent" /> Setting it up from scratch — the checklist
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                If you were starting with an empty repo, this is the exact order I&apos;d do it
                in. Steps 1–4 you write once; step 5 you run forever.
              </p>
              <ol className="mt-4 space-y-3">
                {[
                  {
                    h: "1. Add the k6 scripts to your repo",
                    d: "Create tests/k6/<scenario>/ with main.js, action.js, bearer.js and the test-scripts (smoke/sanity/load). Put your test data CSV under data/. This is the only test logic you own.",
                  },
                  {
                    h: "2. Create the per-environment .env file",
                    d: "Add .github/workflows/.dev-euwe.env with the four vital values: ARM_CLIENT_ID (the workload/service-principal identity), AKS_REGION (e.g. euwe), AKS_TIER (npr/prd), AKS_NAMESPACE (your app's namespace). One file per environment-region.",
                  },
                  {
                    h: "3. Wire up identity + secrets",
                    d: "Register the service principal for OIDC federated login (so no static credentials live in GitHub), grant it access to your namespace, and add K6_SECRETS (a JSON blob) plus any client id/secret as repo/environment secrets.",
                  },
                  {
                    h: "4. Add the thin caller workflow",
                    d: "Create .github/workflows/on-demand-perftest.yml with workflow_dispatch inputs, and a job that uses: the central reusable workflow, forwarding environment-region, test-script, VUs, ramp-up, duration, think-time and secrets. ~20 lines total.",
                  },
                  {
                    h: "5. Run it",
                    d: "Actions tab → pick the workflow → Run workflow → choose environment + load profile. The reusable workflow logs into the cluster, deploys the k6 pod in your namespace, drives your Service, and streams live metrics to Grafana via InfluxDB.",
                  },
                ].map((s) => (
                  <li key={s.h} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                    <p className="font-semibold text-primary">{s.h}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.d}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-6 rounded-xl bg-primary/5 p-4">
                <p className="text-sm font-semibold text-primary">The vital configuration, in one place</p>
                <Code>{`# .github/workflows/.dev-euwe.env   ← the 4 values that decide WHERE the test runs
ARM_CLIENT_ID=<workload-identity-app-id>   # who you authenticate as (OIDC)
AKS_REGION=euwe                            # which regional cluster
AKS_TIER=npr                               # non-prod / prod tier
AKS_NAMESPACE=<your-app-namespace>         # where the k6 pod is deployed

# repo/environment secrets
K6_SECRETS={"CLIENT_SECRET":"...", ...}    # merged into the k6 data object`}</Code>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Step 9 - watch */}
        <div className="container-page">
          <Reveal>
            <div className="card">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-primary">
                <Gauge className="h-6 w-6 text-accent" /> 9. What to watch (and gate on)
              </h2>
              <ul className="mt-4 space-y-2">
                {[
                  "p95 / p99 latency — averages hide pain; percentiles expose it.",
                  "Error rate under 1% — spikes here usually beat latency to the truth.",
                  "Throughput (req/s) vs VUs — where it stops scaling is your saturation point.",
                  "Resource saturation — CPU, memory, GC, connection pools on the system under test.",
                  "Consistency across runs — one green run isn't a result; a repeatable one is.",
                ].map((t) => (
                  <li key={t} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="text-accent">▹</span> {t}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
                Wire the thresholds from step 5 into your pipeline and the template becomes a{" "}
                <strong>release gate</strong>: green means ship, red means investigate — no
                spreadsheet, no guesswork.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Step 10 - AI reporting & analysis */}
        <div className="container-page">
          <Reveal>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Sparkles className="h-6 w-6 text-accent" /> 10. Auto-report &amp; AI analysis
            </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                A raw k6 result or a Grafana panel still needs a human to interpret it. The last
                piece of the template turns numbers into a <strong>written verdict</strong>. The
                key is that it analyses <strong>two sides at once</strong>: the{" "}
                <em>client-side</em> load result (what the user experienced) and the{" "}
                <em>server-side</em> metrics from <strong>OpenTelemetry / Prometheus</strong> and{" "}
                <strong>SignalFx / Splunk Observability</strong> (why the system behaved that
                way) — then correlates them before an LLM ever sees the data.
              </p>
            </Reveal>

            <Reveal>
              <div className="mt-6 card">
                <p className="text-sm font-semibold text-primary">
                  The one comparison that matters: client vs server
                </p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  k6 measures from outside; the service measures from inside. The{" "}
                  <strong>gap between the two p95s</strong> immediately narrows the search:
                </p>
                <Code>{`client p95 (k6)  1042 ms
server p95 (OTel)  934 ms      → gap 10%  = the APP owns the latency
                               → look at DB, GC, downstream calls

client p95 (k6)  1042 ms
server p95 (OTel)  180 ms      → gap 83%  = time is OUTSIDE the app
                               → network, ingress, queueing, saturated load generator`}</Code>
              </div>
            </Reveal>

            <Reveal>
              <h3 className="mt-8 text-lg font-bold text-primary">
                What gets collected on each side
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                  <p className="font-semibold text-accent">Client-side — k6</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    From <code>k6 run --summary-export=summary.json</code>: p95/p99/max latency,{" "}
                    <code>http_req_waiting</code> (TTFB, isolates server time from network),
                    error rate, throughput, VUs, threshold results.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                  <p className="font-semibold text-accent">Server-side — Prometheus / OTel</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    PromQL over the exact test window: service p95/p99 and 5xx rate (RED), CPU
                    utilisation &amp; <strong>throttling</strong>, memory, GC pause, heap, Node
                    event-loop lag, DB &amp; downstream p95, connection-pool saturation, pod
                    restarts and replica count (USE).
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                  <p className="font-semibold text-accent">Server-side — SignalFx / Splunk Obs.</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    SignalFlow programs executed for the same start/stop window — service
                    latency, error rate, container CPU/memory utilisation, restarts. Used to fill
                    any gaps Prometheus does not cover.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                  <p className="font-semibold text-accent">Traces — Tempo / Jaeger</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Slowest spans in the window, grouped by operation and ranked by total time
                    contributed — so the report can name the exact hop (<code>db.query.…</code>,
                    a downstream API, a lock) instead of guessing.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <h3 className="mt-8 text-lg font-bold text-primary">
                The pipeline: correlate → gate → explain
              </h3>
              <Code>{`k6 summary ──┐
Prometheus ──┤
SignalFx   ──┼─► correlate ──► SLA gate (deterministic) ──► LLM narrative ──► Markdown
Traces     ──┘       │                   │                      │
                     │                   └─ decides PASS/FAIL   └─ explains & prioritises
                     └─ rules produce: evidence → hypothesis → action`}</Code>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                <strong>Order matters.</strong> Rules run first and produce cited, reproducible
                findings; thresholds then decide PASS/FAIL; the model is handed the verdict plus
                the findings and told to explain — <em>never</em> to re-judge. That keeps the
                gate auditable and stops the AI from hallucinating a pass.
              </p>
            </Reveal>

            <Reveal>
              <h3 className="mt-8 text-lg font-bold text-primary">
                The correlation rules (this is the real analysis)
              </h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="py-2 pr-4 font-semibold">Rule</th>
                      <th className="py-2 font-semibold">What it catches</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-600 dark:text-slate-400">
                    {[
                      ["client p95 ≫ server p95", "Network / ingress / queueing, or a saturated load generator"],
                      ["CPU throttling > 10%", "Limits set too low — latency spikes while CPU looks 'fine'"],
                      ["CPU > 85%", "Compute-bound; check whether the HPA hit its ceiling"],
                      ["GC pause > 15% of p95", "Allocation churn or heap sizing stalling request threads"],
                      ["heap > 85%", "Memory ceiling, OOM risk at higher load"],
                      ["event-loop lag > 50 ms", "Blocking synchronous work in Node.js"],
                      ["DB p95 > 40% of server p95", "Missing index, N+1 pattern, or lock contention"],
                      ["downstream p95 > 40%", "A dependency — not your service — is the bottleneck"],
                      ["pool saturation > 80%", "Connection-pool exhaustion (latency up, CPU flat)"],
                      ["pod restarts > 0", "OOMKill / liveness failure — the run is untrustworthy"],
                      ["client errors ≫ server 5xx", "Timeouts, resets, or ingress-level rejection"],
                    ].map(([r, w]) => (
                      <tr key={r} className="border-t border-slate-200 dark:border-white/10">
                        <td className="py-2 pr-4 font-mono text-xs text-accent">{r}</td>
                        <td className="py-2">{w}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>

            <Reveal>
              <h3 className="mt-8 text-lg font-bold text-primary">The payload the model receives</h3>
              <Code>{`{
  "run":   { "service": "entity-api", "vus": 50, "rampup": "2m", "duration": "10m" },
  "gate":  { "verdict": "FAIL", "passed": 1, "failed": 6,
             "checks": [ { "metric": "p95_ms", "actual": 1042.6, "op": "<", "value": 800,
                           "status": "FAIL", "deltaPct": 30.3 } ] },
  "k6":     { "p95_ms": 1042.6, "p99_ms": 2310.9, "error_rate": 0.0243, "tps": 238.7 },
  "server": { "server_p95_ms": 934, "cpu_utilization_pct": 91.4, "cpu_throttle_pct": 27.8,
              "gc_pause_p95_ms": 186, "heap_used_pct": 88.3, "db_p95_ms": 601,
              "connection_pool_saturation_pct": 94, "pod_restarts": 1 },
  "traces": [ { "name": "db.query.getEntityByCode", "p95_ms": 601, "max_ms": 1890 } ],
  "findings": [ { "severity": "HIGH", "title": "Container CPU throttling detected",
                  "evidence": "...", "hypothesis": "...", "action": "..." } ]
}`}</Code>

              <p className="mt-4 text-sm font-semibold text-primary">System prompt</p>
              <Code>{`You are a senior performance engineer writing a release-readiness report.

- The PASS/FAIL verdict is already decided by deterministic SLA thresholds.
  Never contradict it.
- Use ONLY the data provided. If evidence is missing, say so explicitly.
- Correlate client-side (k6) numbers with server-side metrics and traces.
- Be specific and quantitative. Lead with the single most likely bottleneck.

Sections: Executive summary · What the data shows · Most likely root cause
          · Recommended actions · Confidence & gaps`}</Code>
            </Reveal>

            <Reveal>
              <h3 className="mt-8 text-lg font-bold text-primary">Wiring it into the pipeline</h3>
              <Code>{`- name: Run load test
  run: k6 run --summary-export=summary.json tests/k6/getEntityByCode/load-test.js

- name: Generate AI performance report
  env:
    OPENAI_API_KEY: ${dollar}{{ secrets.OPENAI_API_KEY }}
    PROM_TOKEN:     ${dollar}{{ secrets.PROM_TOKEN }}
    SFX_TOKEN:      ${dollar}{{ secrets.SFX_TOKEN }}
  run: |
    node tools/perf-ai-report/index.mjs \\
      --config perf/report-config.json \\
      --k6 summary.json \\
      --out REPORT.md \\
      --fail-on-gate          # exit 1 when the gate fails

# the report is appended to $GITHUB_STEP_SUMMARY automatically,
# so it renders on the workflow run page — and can be posted to a PR or Teams.`}</Code>
            </Reveal>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: FileText,
                t: "1. Collect the evidence",
                d: "k6 summary (p95/p99, TTFB, error rate, TPS, thresholds) plus the run parameters, so the report is self-describing and comparable run to run.",
              },
              {
                icon: Activity,
                t: "2. Pull server-side signals",
                d: "PromQL/SignalFlow queries scoped to the exact test window: RED metrics from OTel, USE metrics from the cluster, and the slowest spans from traces.",
              },
              {
                icon: BrainCircuit,
                t: "3. Gate, then explain",
                d: "Thresholds decide PASS/FAIL deterministically; correlation rules produce cited findings; the LLM turns them into a prioritised, readable report.",
              },
            ].map((x) => (
              <Reveal key={x.t}>
                <div className="card h-full">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <x.icon className="h-5 w-5 text-accent" /> {x.t}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{x.d}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-6 card">
              <p className="text-sm font-semibold text-primary">
                What comes out — a real generated report
              </p>
              <Code>{`# Performance Report — entity-api
> Verdict: ❌ FAIL · dev-euwe · load-test.js

## SLA gate (deterministic)
| Metric                  | Actual          | SLA    | Result  |
| Client p95 latency (ms) | 1042.6 (+30.3%) | < 800  | ❌ FAIL |
| Error rate              | 0.0243 (+143%)  | < 0.01 | ❌ FAIL |
| Server-side p95 (ms)    | 934 (+55.7%)    | < 600  | ❌ FAIL |
| Throughput (req/s)      | 238.7 (+19.3%)  | > 200  | ✅ PASS |

## Client-side vs server-side
| Signal      | Client (k6) | Server (OTel / SignalFx) |
| p95 latency | 1042.6 ms   | 934 ms                   |
| Error rate  | 2.43%       | 2.29%                    |

## Correlated findings
### 🔴 Container CPU throttling detected
- Evidence:   CPU was throttled 27.8% of scheduling periods during the test.
- Hypothesis: Limits are too close to demand — the kernel pauses the workload,
              which shows up as latency spikes rather than high CPU.
- Action:     Raise the CPU limit and re-run.

### 🔴 Database time dominates the request
- Evidence:   DB p95 601 ms is 64.3% of server p95 934 ms.
- Hypothesis: Missing index, N+1 query, or lock contention under concurrency.
- Action:     Check execution plans for the hot predicate.`}</Code>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Every finding carries <strong>evidence → hypothesis → action</strong>, so the
                report is reviewable rather than a black box — and an engineer can disagree with
                it using the same numbers.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                {
                  t: "Why OpenTelemetry matters here",
                  d: "Load numbers tell you THAT it got slow; OTel traces tell you WHERE. With spans in the same window, the AI can point at the exact hop — a DB call, a downstream API, a lock — instead of guessing.",
                },
                {
                  t: "SignalFx / Splunk Observability",
                  d: "It supplies the infra side of the story: CPU saturation, memory pressure, GC pauses, pod restarts. Correlating these with the k6 timeline separates 'the app is slow' from 'the app is starved'.",
                },
                {
                  t: "Deterministic first, AI second",
                  d: "Thresholds still decide PASS/FAIL (step 5). The AI explains and prioritises — it never overrides the gate. That keeps results trustworthy and auditable.",
                },
                {
                  t: "Where the report lands",
                  d: "Rendered as Markdown/PDF and attached to the workflow run, posted on the PR, or pushed to a Teams/Slack channel — so a release decision needs no manual dashboard reading.",
                },
              ].map((x) => (
                <div key={x.t} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                  <p className="font-semibold text-primary">{x.t}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{x.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
