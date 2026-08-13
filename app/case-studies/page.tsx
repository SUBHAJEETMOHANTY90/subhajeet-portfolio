import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { caseStudies } from "@/lib/data";
import { Target, Bug, FlaskConical, Search, Wrench } from "lucide-react";

export const metadata: Metadata = { title: "Case Studies", description: "In-depth performance engineering case studies with before/after metrics." };

export default function CaseStudiesPage() {
  return (
    <>
      <PageHeader eyebrow="Case Studies" title="Deep-Dive Case Studies" subtitle="Business context, testing strategy, investigation, root cause and measurable results." />
      <section className="section space-y-16">
        {caseStudies.map((c) => (
          <div key={c.slug} className="container-page">
            <Reveal>
              <div className="card">
                <h2 className="text-2xl font-bold text-primary">{c.title}</h2>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold"><Target className="h-4 w-4 text-accent" /> Business Context</h4>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{c.context}</p>
                    <h4 className="mt-4 flex items-center gap-2 font-semibold"><Bug className="h-4 w-4 text-accent" /> Performance Challenge</h4>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{c.challenge}</p>
                    <h4 className="mt-4 flex items-center gap-2 font-semibold"><FlaskConical className="h-4 w-4 text-accent" /> Testing Strategy</h4>
                    <div className="mt-2 flex flex-wrap gap-2">{c.strategy.map((s) => <span key={s} className="chip">{s}</span>)}</div>
                  </div>
                  <div>
                    <h4 className="flex items-center gap-2 font-semibold"><Search className="h-4 w-4 text-accent" /> Investigation</h4>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      {c.investigation.map((v) => <li key={v} className="flex gap-2"><span className="text-primary">-</span> {v}</li>)}
                    </ul>
                    <h4 className="mt-4 font-semibold">Root Cause</h4>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{c.rootCause}</p>
                    <h4 className="mt-4 flex items-center gap-2 font-semibold"><Wrench className="h-4 w-4 text-accent" /> Resolution</h4>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{c.resolution}</p>
                  </div>
                </div>

                <h4 className="mt-8 font-semibold">Results (Before vs After)</h4>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {c.results.map((r) => (
                    <div key={r.metric} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                      <p className="text-xs uppercase tracking-wide text-slate-500">{r.metric}</p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-sm text-slate-400 line-through">{r.before}</span>
                        <span className="text-lg font-bold text-accent">{r.after}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        ))}
      </section>
    </>
  );
}
