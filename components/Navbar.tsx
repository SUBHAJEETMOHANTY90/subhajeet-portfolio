"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Activity } from "lucide-react";
import { navLinks } from "@/lib/data";
import { ThemeToggle } from "./ThemeToggle";
import { SearchModal } from "./SearchModal";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Normalize trailing slashes so "/about/" matches "/about" (trailingSlash: true)
  const norm = (p: string) => (p !== "/" && p.endsWith("/") ? p.slice(0, -1) : p);
  const isActive = (href: string) => norm(pathname) === norm(href);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-secondary/80">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white"><Activity className="h-4 w-4" /></span>
          <span className="gradient-text">SM</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${isActive(l.href) ? "bg-primary/10 font-semibold text-primary" : "text-slate-600 hover:text-primary dark:text-slate-300"}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SearchModal />
          <ThemeToggle />
          <button className="lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-secondary lg:hidden">
          <div className="grid grid-cols-2 gap-1">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} aria-current={isActive(l.href) ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${isActive(l.href) ? "bg-primary/10 font-semibold text-primary" : "text-slate-600 dark:text-slate-300"}`}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
