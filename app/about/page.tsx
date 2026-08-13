import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { profile, experience } from "@/lib/data";
import { Quote } from "lucide-react";

export const metadata: Metadata = { title: "About", description: profile.summary };

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About Me" title="My Career Journey" subtitle={profile.summary} />
      <section className="section">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {experience.map((e, i) => (
            <Reveal key={e.role} delay={i * 0.06}>
              <div className="card h-full">
                <h3 className="text-lg font-semibold text-primary">{e.role}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{e.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="container-page mt-12">
          <Reveal>
            <div className="card relative border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
              <Quote className="h-8 w-8 text-accent" />
              <p className="mt-4 text-xl font-medium italic sm:text-2xl">&quot;{profile.philosophy}&quot;</p>
              <p className="mt-4 text-sm font-semibold text-primary">Engineering Philosophy</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
