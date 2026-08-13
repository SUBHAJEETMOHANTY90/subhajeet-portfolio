import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { WarStoryCard } from "@/components/WarStoryCard";
import { warStories } from "@/lib/data";

export const metadata: Metadata = { title: "Performance War Stories", description: "Real production incidents, root causes and business outcomes." };

export default function WarStoriesPage() {
  return (
    <>
      <PageHeader eyebrow="War Stories" title="Performance War Stories" subtitle="Battle-tested production incidents told as expandable stories." />
      <section className="section">
        <div className="container-page space-y-4">
          {warStories.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.04}><WarStoryCard story={s} index={i} /></Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
