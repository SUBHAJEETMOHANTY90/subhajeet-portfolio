import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { successStories } from "@/lib/data";
import { Trophy } from "lucide-react";

export const metadata: Metadata = { title: "Top 10 Success Stories", description: "The most impactful performance engineering problems solved." };

export default function SuccessStoriesPage() {
  return (
    <>
      <PageHeader eyebrow="For Interviewers" title="Top 10 Performance Engineering Success Stories" subtitle="A rapid tour of the highest-impact problems solved." />
      <section className="section">
        <div className="container-page grid gap-6 md:grid-cols-2">
          {successStories.map((s, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div className="card h-full">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-bold text-white">{i + 1}</span>
                  <Trophy className="h-5 w-5 text-accent" />
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <p><span className="font-semibold text-primary">Challenge:</span> {s.challenge}</p>
                  <p><span className="font-semibold text-primary">Root Cause:</span> {s.rootCause}</p>
                  <p><span className="font-semibold text-primary">Solution:</span> {s.solution}</p>
                  <p><span className="font-semibold text-primary">Business Impact:</span> {s.impact}</p>
                  <p className="mt-2 rounded-lg bg-accent/10 px-3 py-2 font-medium text-accent">{s.metrics}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
