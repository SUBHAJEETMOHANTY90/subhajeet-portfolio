import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
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
                <strong>What you'll build:</strong> a self-contained k6 template where the{" "}
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
                <code>test-script</code>'s <code>options</code>, while the{" "}
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
              <KeyRound className="h-6 w-6 text-accent" /> 4. Handle auth so soak tests don't die
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
              <em>fails itself</em> when SLAs are breached — that's what makes it a gate.
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
              <GitBranch className="h-6 w-6 text-accent" /> 8. Make it on-demand in CI
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Expose the same knobs as CI inputs so anyone can launch a run from a button —
              choose environment, VUs, ramp-up and duration. Secrets stay in the secret store,
              and a reusable action runs k6 <strong>inside the cluster</strong> (next to the
              system under test) while streaming results to a time-series DB for dashboards.
            </p>
            <Code>{`name: On-demand performance test
on:
  workflow_dispatch:
    inputs:
      environment:  { type: choice,  options: [dev, sit, staging], required: true }
      test-script:  { type: choice,  options: [smoke-test.js, sanity-test.js, load-test.js], default: smoke-test.js }
      virtual-users:{ type: string,  default: "1",  required: true }
      ramp-up:      { type: string,  default: "1m", required: true }
      duration:     { type: string,  default: "10m", required: true }
      think-time:   { type: string,  default: "1",  required: true }

jobs:
  perf:
    runs-on: ubuntu-latest
    environment: ${dollar}{{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4

      # 1) pull env values + secrets for the chosen environment
      - name: Load env
        uses: your-org/export-dotenv@v1
        with:
          path: ./.github/workflows/.${dollar}{{ inputs.environment }}.env
          secrets: ${dollar}{{ toJSON(secrets) }}

      # 2) authenticate to the cluster that hosts the system under test
      - name: Cluster login
        uses: your-org/cluster-login@v1

      # 3) run k6 IN-CLUSTER via a reusable action; stream results to InfluxDB → Grafana
      - name: Run k6
        uses: your-org/run-k6@v1
        with:
          namespace:  ${dollar}{{ env.NAMESPACE }}
          test-path:  perf/scenarios/getEntityByCode
          test-script: ${dollar}{{ inputs.test-script }}
          cpu-limit: "1000m"
          memory-limit: "2000Mi"
          influxdb: "influxdb.<cluster-internal>:8086/loadtest"
          test-custom-data-object: |
            {
              "VUS":"${dollar}{{ inputs.virtual-users }}",
              "RAMPUP":"${dollar}{{ inputs.ramp-up }}",
              "DURATION":"${dollar}{{ inputs.duration }}",
              "SLEEP":"${dollar}{{ inputs.think-time }}",
              "CLIENT_ID":"${dollar}{{ vars.CLIENT_ID }}",
              "CLIENT_SECRET":"${dollar}{{ secrets.CLIENT_SECRET }}",
              "SUBSCRIPTION_KEY":"${dollar}{{ vars.SUBSCRIPTION_KEY }}"
            }`}</Code>
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
      </section>
    </>
  );
}
