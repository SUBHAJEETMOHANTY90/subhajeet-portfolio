import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { achievements } from "@/lib/data";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = { title: "Achievements", description: "Career timeline of measurable performance engineering wins." };

export default function AchievementsPage() {
  return (
    <>
      <PageHeader eyebrow="Achievements" title="Career Timeline" subtitle="Each milestone: the challenge, the investigation, the fix and the business impact." />
      <section className="section">
        <div className="container-page relative">
          <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-primary to-accent sm:left-1/2" />
          <div className="space-y-10">
            {achievements.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.05}>
                <div className={`relative pl-12 sm:w-1/2 sm:pl-0 ${i % 2 ? "sm:ml-auto sm:pl-12" : "sm:pr-12 sm:text-right"}`}>
                  <span className="absolute left-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary sm:left-auto sm:right-[-10px]" style={i % 2 ? { right: "auto", left: "-10px" } : {}}>
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </span>
                  <div className="card">
                    <h3 className="text-lg font-bold text-primary">{a.title}</h3>
                    <p className="mt-3 text-sm"><span className="font-semibold">Challenge:</span> {a.challenge}</p>
                    <p className="mt-2 text-sm"><span className="font-semibold">Investigation:</span> {a.investigation}</p>
                    <p className="mt-2 text-sm"><span className="font-semibold">Resolution:</span> {a.resolution}</p>
                    <div className="mt-4 space-y-1">
                      {a.outcome.map((o) => (
                        <p key={o.k} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 sm:justify-start">
                          <CheckCircle2 className="h-4 w-4 text-accent" /> <span className="font-medium">{o.k}:</span> {o.v}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
