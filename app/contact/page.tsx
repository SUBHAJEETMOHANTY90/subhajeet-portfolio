import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { profile } from "@/lib/data";
import { Mail, MapPin, Linkedin } from "lucide-react";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with " + profile.name };

export default function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Let us Connect" subtitle="Open to performance engineering roles, consulting and collaboration." />
      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div className="space-y-4">
              <a href={`mailto:${profile.email}`} className="card flex items-center gap-3"><Mail className="h-5 w-5 text-accent" /> <span className="text-sm">{profile.email}</span></a>
              <div className="card flex items-center gap-3"><MapPin className="h-5 w-5 text-accent" /> <span className="text-sm">{profile.location}</span></div>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="card flex items-center gap-3"><Linkedin className="h-5 w-5 text-accent" /> <span className="text-sm">LinkedIn Profile</span></a>
            </div>
          </Reveal>
          <Reveal delay={0.1}><ContactForm /></Reveal>
        </div>
      </section>
    </>
  );
}
