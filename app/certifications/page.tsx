import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { certifications } from "@/lib/data";
import { Award, Download } from "lucide-react";

export const metadata: Metadata = { title: "Certifications", description: "Industry certifications in performance, cloud and observability." };

export default function CertificationsPage() {
  return (
    <>
      <PageHeader eyebrow="Certifications" title="Certifications & Badges" subtitle="Validated expertise across performance, cloud and observability." />
      <section className="section">
        <div className="container-page grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certifications.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.06}>
              <div className="card flex h-full flex-col">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><Award className="h-6 w-6" /></div>
                <h3 className="mt-4 font-semibold">{c.name}</h3>
                <p className="mt-1 text-sm text-primary">{c.org}</p>
                <p className="mt-1 text-xs text-slate-500">Issued {c.date}</p>
                <p className="mt-1 text-xs text-slate-500">Credential ID: {c.credentialId}</p>
                <a href={c.file} download className="btn-ghost mt-4 w-fit"><Download className="h-4 w-4" /> Certificate</a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
