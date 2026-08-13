import { Reveal } from "./Reveal";

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="container-page pt-28 sm:pt-32">
      <Reveal>
        {eyebrow && <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-accent">{eyebrow}</p>}
        <h1 className="text-3xl font-bold sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-slate-600 dark:text-slate-400">{subtitle}</p>}
      </Reveal>
    </div>
  );
}
