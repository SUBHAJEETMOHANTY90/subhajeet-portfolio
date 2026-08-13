import Link from "next/link";
import { Linkedin, Github, Download, Mail, MapPin } from "lucide-react";
import { profile } from "@/lib/data";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-secondary-light/40">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="text-lg font-bold gradient-text">{profile.name}</h3>
          <p className="mt-2 max-w-xs text-sm text-slate-600 dark:text-slate-400">
            Designed and built to showcase real-world Performance Engineering excellence.
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4" /> {profile.location}</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/case-studies" className="hover:text-primary">Case Studies</Link></li>
            <li><Link href="/war-stories" className="hover:text-primary">War Stories</Link></li>
            <li><Link href="/success-stories" className="hover:text-primary">Top 10 Success Stories</Link></li>
            <li><Link href="/certifications" className="hover:text-primary">Certifications</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Connect</h4>
          <div className="flex flex-wrap gap-3">
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn-ghost"><Linkedin className="h-4 w-4" /> LinkedIn</a>
            <a href={profile.github} target="_blank" rel="noreferrer" className="btn-ghost"><Github className="h-4 w-4" /> GitHub</a>
            <a href={profile.resume} download className="btn-ghost"><Download className="h-4 w-4" /> Resume</a>
            <a href={`mailto:${profile.email}`} className="btn-ghost"><Mail className="h-4 w-4" /> Email</a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 py-5 text-center text-xs text-slate-500 dark:border-white/10">
        Copyright {new Date().getFullYear()} {profile.name}. All rights reserved.
      </div>
    </footer>
  );
}
