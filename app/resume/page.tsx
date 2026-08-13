import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { profile, skillCategories, certifications, achievements } from "@/lib/data";
import { Download } from "lucide-react";

export const metadata: Metadata = { title: "Resume", description: "View and download the resume of " + profile.name };

export default function ResumePage() {
  return (
    <>
      <PageHeader eyebrow="Resume" title="Resume" subtitle="Preview the resume below or download the PDF." />
      <section className="section">
        <div className="container-page">
          <div className="mb-6 flex flex-wrap gap-3">
            <a href={profile.resume} download className="btn-primary"><Download className="h-4 w-4" /> Download PDF</a>
            <a href={profile.resume} target="_blank" rel="noreferrer" className="btn-ghost">Open in new tab</a>
          </div>
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
              <object data={profile.resume} type="application/pdf" className="h-[80vh] w-full">
                <div className="grid h-[40vh] place-items-center p-8 text-center text-sm text-slate-500">
                  Resume preview unavailable. Add <code>public/resume.pdf</code> then reload, or
                  <a href={profile.resume} download className="text-primary"> download here</a>.
                </div>
              </object>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <div className="card">
              <h3 className="font-semibold text-primary">Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {skillCategories.flatMap((c) => c.items).slice(0, 14).map((s) => <span key={s} className="chip">{s}</span>)}
              </div>
            </div>
            <div className="card">
              <h3 className="font-semibold text-primary">Highlighted Achievements</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {achievements.map((a) => <li key={a.title}>- {a.title}</li>)}
              </ul>
            </div>
            <div className="card">
              <h3 className="font-semibold text-primary">Certifications</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                {certifications.slice(0, 5).map((c) => <li key={c.name}>- {c.name}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
