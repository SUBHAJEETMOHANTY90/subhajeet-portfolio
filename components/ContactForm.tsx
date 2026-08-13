"use client";
import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Demo only. Wire up to Formspree, Resend, or an API route for production.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="card flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-accent" />
        <p className="font-semibold">Thanks, {form.name || "there"}!</p>
        <p className="text-sm text-slate-500">Your message has been captured (demo). Connect a backend to receive it.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-white/15" />
        <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-white/15" />
      </div>
      <textarea required rows={5} placeholder="Your message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-2.5 text-sm outline-none focus:border-primary dark:border-white/15" />
      <button type="submit" className="btn-primary"><Send className="h-4 w-4" /> Send Message</button>
    </form>
  );
}
