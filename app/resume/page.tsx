import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { PrintButton } from "@/components/PrintButton";
import { profile, skillCategories, certifications, achievements, stats, experience, workHistory, education } from "@/lib/data";
import { Mail, MapPin, Linkedin } from "lucide-react";

export const metadata: Metadata = { title: "Resume", description: "View and download the resume of " + profile.name };

export default function ResumePage() {
  return (
    <>
      <div className="no-print">
        <PageHeader eyebrow="Resume" title="Resume" subtitle="Review the resume below, then use Download PDF to save a copy." />
      </div>
      <section className="section">
        <div className="container-page">
          <div className="no-print mb-6 flex flex-wrap gap-3">
            <PrintButton label="Download PDF" />
          </div>

          {/* Printable resume sheet */}
          <Reveal>
            <div id="resume-sheet" className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-8 text-slate-800 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 sm:p-10">
              {/* Header */}
              <header className="border-b border-slate-200 pb-5 dark:border-white/10">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="mt-1 text-lg font-semibold text-primary">{profile.title}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1"><Mail className="h-4 w-4" /> {profile.email}</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" /> {profile.location}</span>
                  <a href={profile.linkedin} className="inline-flex items-center gap-1 hover:text-primary"><Linkedin className="h-4 w-4" /> LinkedIn</a>
                </div>
              </header>

              {/* Summary */}
              <section className="mt-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-accent">Professional Summary</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{profile.summary}</p>
              </section>

              {/* Key metrics */}
              <section className="mt-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-accent">Career Highlights</h2>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-slate-200 p-3 text-center dark:border-white/10">
                      <div className="text-xl font-bold text-primary">{s.value}{s.suffix}</div>
                      <div className="mt-1 text-[11px] leading-tight text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Core expertise */}
              <section className="mt-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-accent">Core Expertise</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {experience.map((e) => (
                    <li key={e.role} className="text-sm">
                      <span className="font-semibold">{e.role}:</span>{" "}
                      <span className="text-slate-600 dark:text-slate-400">{e.desc}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Skills */}
              <section className="mt-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-accent">Technical Skills</h2>
                <div className="mt-3 space-y-2">
                  {skillCategories.map((c) => (
                    <div key={c.category} className="text-sm">
                      <span className="font-semibold">{c.category}:</span>{" "}
                      <span className="text-slate-600 dark:text-slate-400">{c.items.join(", ")}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Achievements */}
              <section className="mt-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-accent">Selected Achievements</h2>
                <ul className="mt-3 space-y-3">
                  {achievements.map((a) => (
                    <li key={a.title} className="text-sm">
                      <p className="font-semibold">{a.title}</p>
                      <p className="text-slate-600 dark:text-slate-400">{a.resolution}</p>
                      <p className="mt-1 text-xs text-primary">
                        {a.outcome.map((o) => `${o.k}: ${o.v}`).join("  \u2022  ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Professional experience */}
              <section className="mt-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-accent">Professional Experience</h2>
                <div className="mt-3 space-y-5">
                  {workHistory.map((job) => (
                    <div key={job.company + job.period}>
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p className="font-semibold">{job.role} — {job.company}</p>
                        <p className="text-xs italic text-slate-500">{job.period}</p>
                      </div>
                      {job.client && <p className="text-xs text-slate-500">Client: {job.client}</p>}
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-400">
                        {job.points.map((p) => <li key={p}>{p}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>

              {/* Certifications */}
              <section className="mt-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-accent">Certifications</h2>
                <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {certifications.map((c) => (
                    <li key={c.name} className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{c.name}</span> — {c.org}{c.date ? ` (${c.date})` : ""}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Education */}
              <section className="mt-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-accent">Education</h2>
                <ul className="mt-3 space-y-1.5">
                  {education.map((e) => (
                    <li key={e.school} className="text-sm">
                      <span className="font-medium">{e.qualification}</span>
                      <span className="text-slate-600 dark:text-slate-400"> — {e.school} ({e.period})</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
