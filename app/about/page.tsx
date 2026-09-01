import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { Counter } from "@/components/Counter";
import { profile, about, stats } from "@/lib/data";
import { Quote, Target, CheckCircle2, Download, Mail } from "lucide-react";

export const metadata: Metadata = { title: "About", description: profile.summary };

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About Me" title="My Career Journey" subtitle={profile.tagline} />
      <section className="section pt-0">
        <div className="container-page">
          {/* Headline + bio */}
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-bold leading-snug sm:text-3xl">
                &ldquo;{about.headline}&rdquo;
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mx-auto mt-8 max-w-3xl space-y-4 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {about.bio.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </Reveal>

          {/* By the numbers */}
          <Reveal delay={0.1}>
            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5">
              {stats.map((s) => (
                <div key={s.label} className="card text-center">
                  <div className="text-2xl font-bold text-primary sm:text-3xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* What I'm known for */}
      <section className="section pt-0">
        <div className="container-page">
          <Reveal>
            <h3 className="text-center text-sm font-bold uppercase tracking-widest text-accent">What I&apos;m Known For</h3>
          </Reveal>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {about.strengths.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <div className="card h-full">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary"><Target className="h-5 w-5" /></span>
                    <h4 className="text-lg font-semibold">{s.title}</h4>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{s.proof}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How I work */}
      <section className="section pt-0">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-accent">How I Work</h3>
              <ul className="mt-4 space-y-3">
                {about.principles.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span className="text-slate-600 dark:text-slate-300">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card relative h-full border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <Quote className="h-8 w-8 text-accent" />
              <p className="mt-4 text-xl font-medium italic sm:text-2xl">&quot;{profile.philosophy}&quot;</p>
              <p className="mt-4 text-sm font-semibold text-primary">Engineering Philosophy</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/resume" className="btn-primary"><Download className="h-4 w-4" /> View Resume</Link>
                <Link href="/contact" className="btn-ghost"><Mail className="h-4 w-4" /> Let&apos;s Talk</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
