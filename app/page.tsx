import Link from "next/link";
import { Download, Linkedin, Github, Mail, ArrowRight, Gauge, TrendingUp, Layers, DollarSign } from "lucide-react";
import { profile, stats, businessImpact } from "@/lib/data";
import { Counter } from "@/components/Counter";
import { Reveal } from "@/components/Reveal";

const impactIcons = [Gauge, TrendingUp, Layers, DollarSign];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden grid-bg">
        <div className="container-page flex flex-col items-center gap-10 pt-32 pb-16 sm:pt-40 lg:flex-row lg:justify-between">
          <Reveal className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">Performance Engineering</p>
            <h1 className="text-4xl font-bold leading-tight sm:text-6xl">{profile.name}</h1>
            <p className="mt-3 text-xl font-semibold text-primary">{profile.title}</p>
            <p className="mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-400">&quot;{profile.tagline}&quot;</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={profile.resume} download className="btn-primary"><Download className="h-4 w-4" /> Download Resume</a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn-ghost"><Linkedin className="h-4 w-4" /> LinkedIn</a>
              <a href={profile.github} target="_blank" rel="noreferrer" className="btn-ghost"><Github className="h-4 w-4" /> GitHub</a>
              <Link href="/contact" className="btn-ghost"><Mail className="h-4 w-4" /> Contact Me</Link>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative h-56 w-56 animate-float sm:h-72 sm:w-72">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-accent opacity-30 blur-2xl" />
              <div className="relative grid h-full w-full place-items-center overflow-hidden rounded-full border-4 border-white/20 bg-secondary-light">
                {/* Replace initials with a photo: put profile.jpg in /public and use next/image */}
                <span className="text-6xl font-bold gradient-text">SM</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="card text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl"><Counter value={s.value} suffix={s.suffix} /></div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section bg-slate-50 dark:bg-secondary-light/30">
        <div className="container-page">
          <Reveal><h2 className="text-2xl font-bold sm:text-3xl">Business Impact</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Measurable outcomes, not just tooling.</p></Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {businessImpact.map((b, i) => {
              const Icon = impactIcons[i % impactIcons.length];
              return (
                <Reveal key={b.label} delay={i * 0.08}>
                  <div className="card h-full">
                    <Icon className="h-8 w-8 text-accent" />
                    <p className="mt-4 text-xl font-bold">{b.value}</p>
                    <p className="mt-1 text-sm font-medium text-primary">{b.label}</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{b.detail}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/case-studies" className="btn-primary">Explore Case Studies <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
