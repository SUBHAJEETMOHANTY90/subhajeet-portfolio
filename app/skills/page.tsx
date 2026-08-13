import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { skillCategories } from "@/lib/data";

export const metadata: Metadata = { title: "Skills & Tools", description: "Performance testing, monitoring, cloud, backend and database expertise." };

export default function SkillsPage() {
  return (
    <>
      <PageHeader eyebrow="Skills & Tools" title="Technical Toolbox" subtitle="Categorized expertise across the full performance engineering lifecycle." />
      <section className="section">
        <div className="container-page grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skillCategories.map((c, i) => (
            <Reveal key={c.category} delay={i * 0.06}>
              <div className="card h-full transition hover:-translate-y-1 hover:shadow-glow">
                <h3 className="text-lg font-semibold text-primary">{c.category}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.items.map((it) => <span key={it} className="chip">{it}</span>)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
