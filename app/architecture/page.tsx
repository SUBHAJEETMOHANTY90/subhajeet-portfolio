import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import {
  Globe,
  Server,
  Layers,
  Database,
  Boxes,
  Activity,
  GitBranch,
  Gauge,
  ShieldCheck,
  Flame,
  Timer,
  ArrowDown,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Architecture Deep Dive",
  description:
    "An anonymized, pattern-level walkthrough of a server-side-rendered e-commerce product micro-frontend: request flow, pod lifecycle, autoscaling, observability and the k6 performance pipeline.",
};

const anatomy = [
  {
    icon: Globe,
    name: "Edge CDN",
    role: "Global entry point. Routes traffic by product/region, terminates TLS, caches SSR HTML with stale-while-revalidate, and shields origin from spikes.",
  },
  {
    icon: Server,
    name: "SSR Micro-Frontend (Next.js)",
    role: "The application itself. Renders the product page on the server per request/locale, then hydrates in the browser. Deployed as a container on Kubernetes.",
  },
  {
    icon: Layers,
    name: "Shared UI Framework",
    role: "A reusable internal library that fetches page structure + labels and assembles the base template, so every micro-frontend behaves consistently.",
  },
  {
    icon: Boxes,
    name: "Headless CMS / Page API",
    role: "Supplies the page layout, content model, redirect rules and preview mode. The app asks it 'what does this page look like?' at render time.",
  },
  {
    icon: Database,
    name: "Localization / Labels Service",
    role: "Provides translated strings for every supported locale. Types are code-generated from it for compile-time safety.",
  },
  {
    icon: ShieldCheck,
    name: "Cloud Config + Secrets Store",
    role: "Runtime configuration and secrets, pulled at boot using a workload/managed identity — no secrets baked into the image.",
  },
  {
    icon: Activity,
    name: "Observability (Tracing + RUM)",
    role: "OpenTelemetry traces, structured logs and Real User Monitoring flow to a central platform for latency, errors and Core Web Vitals.",
  },
];

const requestFlow = [
  {
    step: "1",
    title: "Browser → Edge CDN",
    body: "A shopper opens a product URL. The request lands on the Edge CDN with product + region context. If a fresh cached copy exists, it is served immediately.",
  },
  {
    step: "2",
    title: "CDN → Regional Ingress → Pod",
    body: "On a cache miss, the CDN forwards to the nearest region's Kubernetes ingress, which routes through the service to a healthy application pod.",
  },
  {
    step: "3",
    title: "Middleware match",
    body: "Lightweight edge middleware matches the localized product route (e.g. /:locale?/product) and applies preview handling before the page renders.",
  },
  {
    step: "4",
    title: "Server-side data fetch",
    body: "getServerSideProps runs on the server: it resolves the locale, then calls the Shared UI Framework to pull page structure from the Headless CMS and translations from the Localization Service — in parallel.",
  },
  {
    step: "5",
    title: "Redirects & not-found",
    body: "If the CMS marks the page as moved, the app returns a 301/302 redirect. If no data comes back, it returns a 404 — decisions made server-side before any HTML is produced.",
  },
  {
    step: "6",
    title: "Render + cache",
    body: "React renders the product view to HTML on the server. The response goes back through the CDN and is cached briefly (fresh for a few seconds, then stale-while-revalidate) so the next shopper gets an instant hit.",
  },
  {
    step: "7",
    title: "Hydrate + measure",
    body: "The browser hydrates the HTML into an interactive page. RUM and tracing capture real latency, errors and Core Web Vitals for every session.",
  },
];

const lifecycle = [
  {
    icon: ShieldCheck,
    title: "Boot: load config",
    body: "On process start, an instrumentation hook pulls shared + product configuration and secrets from the Cloud Config store using a managed identity, then merges them into the environment.",
  },
  {
    icon: Flame,
    title: "Warmup (startup probe)",
    body: "A dedicated /warmup route pre-loads base-template data for every locale. Kubernetes' startup probe polls it (e.g. up to 20 × 5s) and only marks the pod started once warm — killing cold-start latency on the first real request.",
  },
  {
    icon: Activity,
    title: "Readiness & liveness",
    body: "A tiny /health actuator returns { status: UP }. Readiness gates traffic; liveness restarts a wedged pod. Both are cheap and dependency-free by design.",
  },
  {
    icon: Gauge,
    title: "Autoscale (HPA)",
    body: "A Horizontal Pod Autoscaler watches CPU utilization (target ~60%) and scales replicas up/down between a min and max — capacity follows demand automatically.",
  },
];

const perfPipeline = [
  {
    icon: GitBranch,
    title: "Triggered on demand",
    body: "Performance runs are launched from a CI workflow with parameters: target environment/region, ramp-up time, virtual users, duration, think-time, and even the CPU/memory budget for the load-generator pods.",
  },
  {
    icon: Layers,
    title: "Data-driven scripts",
    body: "k6 scripts read a CSV of realistic entities (e.g. article + market combinations) via a shared in-memory array, so each virtual user exercises a different, valid path — no hot-keying a single record.",
  },
  {
    icon: ShieldCheck,
    title: "Auth handling",
    body: "Scripts fetch an OAuth2 client-credentials bearer token and refresh it ~60s before expiry, so long soak tests never fail on a mid-run token timeout.",
  },
  {
    icon: Timer,
    title: "Load model in stages",
    body: "The workload is shaped in stages — ramp-up to the target VUs, hold steady for the test duration, then ramp-down (about a third of the ramp-up). Smoke, sanity and full-load variants share the same core action.",
  },
  {
    icon: Flame,
    title: "Runs beside the app",
    body: "Load generators run as pods in the same cluster, driving traffic through the real ingress path while tracing and dashboards capture latency, throughput, errors and saturation end-to-end.",
  },
];

const takeaways = [
  "SSR + short-TTL CDN caching keeps product pages fast and origin load low.",
  "A warmup probe is the difference between a cold, slow first hit and a warm pod ready for peak.",
  "Health and warmup endpoints must stay dependency-free — a heavy health check causes cascading restarts under load.",
  "CPU-based HPA reacts to demand, but the right min-replicas and warmup budget decide how gracefully it absorbs a spike.",
  "Realistic, data-driven load with proper token lifecycle is what makes a k6 result trustworthy for a release decision.",
];

export default function ArchitecturePage() {
  return (
    <>
      <PageHeader
        eyebrow="Architecture Deep Dive"
        title="How a Modern SSR Product Micro-Frontend Works"
        subtitle="A generic, pattern-level walkthrough of a cloud-native e-commerce product page — from edge request to pod lifecycle to the performance-test pipeline. All names and details are illustrative."
      />

      <section className="section space-y-16">
        {/* Note */}
        <div className="container-page">
          <Reveal>
            <div className="card border-l-4 border-accent">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <strong>Note:</strong> This page describes a common industry pattern using
                generic component names. It contains no proprietary code, service names,
                endpoints or business logic — it exists to illustrate how these systems are
                architected and, in particular, how I approach their performance.
              </p>
            </div>
          </Reveal>
        </div>

        {/* Anatomy */}
        <div className="container-page">
          <Reveal>
            <h2 className="text-2xl font-bold text-primary">The Anatomy</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              The moving parts and what each one is responsible for.
            </p>
          </Reveal>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {anatomy.map((a) => (
              <Reveal key={a.name}>
                <div className="card h-full">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <a.icon className="h-5 w-5 text-accent" /> {a.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{a.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Request flow */}
        <div className="container-page">
          <Reveal>
            <h2 className="text-2xl font-bold text-primary">Request Flow, Step by Step</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              What happens between a shopper clicking a link and seeing the page.
            </p>
          </Reveal>
          <div className="mt-6 space-y-3">
            {requestFlow.map((f, i) => (
              <Reveal key={f.step}>
                <div className="card flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {f.step}
                  </div>
                  <div>
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.body}</p>
                  </div>
                </div>
                {i < requestFlow.length - 1 && (
                  <div className="flex justify-center py-1 text-slate-300 dark:text-white/20">
                    <ArrowDown className="h-4 w-4" />
                  </div>
                )}
              </Reveal>
            ))}
          </div>
        </div>

        {/* Pod lifecycle */}
        <div className="container-page">
          <Reveal>
            <h2 className="text-2xl font-bold text-primary">Pod Lifecycle & Scaling</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              How a container becomes ready, stays healthy, and scales with load.
            </p>
          </Reveal>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {lifecycle.map((l) => (
              <Reveal key={l.title}>
                <div className="card h-full">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <l.icon className="h-5 w-5 text-accent" /> {l.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{l.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Perf pipeline */}
        <div className="container-page">
          <Reveal>
            <h2 className="text-2xl font-bold text-primary">
              The Performance-Test Pipeline <span className="text-accent">— my lens</span>
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              How load is modelled and executed against this architecture as part of the release process.
            </p>
          </Reveal>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {perfPipeline.map((p) => (
              <Reveal key={p.title}>
                <div className="card h-full">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <p.icon className="h-5 w-5 text-accent" /> {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Takeaways */}
        <div className="container-page">
          <Reveal>
            <div className="card">
              <h2 className="text-2xl font-bold text-primary">Performance Takeaways</h2>
              <ul className="mt-4 space-y-2">
                {takeaways.map((t) => (
                  <li key={t} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="text-accent">▹</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
