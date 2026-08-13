"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { skillCategories, caseStudies, warStories, achievements, certifications } from "@/lib/data";

type Item = { label: string; href: string; group: string };

const index: Item[] = [
  ...skillCategories.flatMap((c) => c.items.map((i) => ({ label: i, href: "/skills", group: "Skill" }))),
  ...caseStudies.map((c) => ({ label: c.title, href: "/case-studies", group: "Case Study" })),
  ...warStories.map((w) => ({ label: w.title, href: "/war-stories", group: "War Story" })),
  ...achievements.map((a) => ({ label: a.title, href: "/achievements", group: "Achievement" })),
  ...certifications.map((c) => ({ label: c.name, href: "/certifications", group: "Certification" })),
];

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const t = q.toLowerCase();
    return index.filter((i) => i.label.toLowerCase().includes(t) || i.group.toLowerCase().includes(t)).slice(0, 12);
  }, [q]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-500 transition hover:border-primary hover:text-primary dark:border-white/15 dark:text-slate-400"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded bg-slate-100 px-1.5 text-[10px] dark:bg-white/10 sm:inline">Ctrl K</kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 p-4 pt-24 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-secondary-light" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-white/10">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                autoFocus value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Search skills, case studies, war stories..."
                className="w-full bg-transparent py-4 text-sm outline-none"
              />
              <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {q && results.length === 0 && <p className="p-4 text-sm text-slate-500">No results for &quot;{q}&quot;</p>}
              {results.map((r, i) => (
                <Link key={i} href={r.href} onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm hover:bg-slate-100 dark:hover:bg-white/5">
                  <span>{r.label}</span>
                  <span className="chip">{r.group}</span>
                </Link>
              ))}
              {!q && <p className="p-4 text-sm text-slate-500">Try: Dynatrace, JMeter, Oracle, AWS, Black Friday...</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
