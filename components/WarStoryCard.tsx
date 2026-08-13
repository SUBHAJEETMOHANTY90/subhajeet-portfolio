"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Flame } from "lucide-react";

type Story = {
  title: string; problem: string; symptoms: string; analysis: string;
  rootCause: string; actions: string; outcome: string;
};

export function WarStoryCard({ story, index }: { story: Story; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const rows: [string, string][] = [
    ["Problem", story.problem], ["Symptoms", story.symptoms], ["Analysis", story.analysis],
    ["Root Cause", story.rootCause], ["Actions Taken", story.actions], ["Business Outcome", story.outcome],
  ];
  return (
    <div className="card">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left">
        <span className="flex items-center gap-3 font-semibold">
          <Flame className="h-5 w-5 text-accent" /> {story.title}
        </span>
        <ChevronDown className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <dl className="mt-4 space-y-3">
              {rows.map(([k, v]) => (
                <div key={k} className="grid gap-1 sm:grid-cols-[140px_1fr]">
                  <dt className="text-sm font-semibold text-primary">{k}</dt>
                  <dd className="text-sm text-slate-600 dark:text-slate-400">{v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
