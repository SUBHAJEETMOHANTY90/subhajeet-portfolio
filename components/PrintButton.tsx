"use client";
import { Printer } from "lucide-react";

/**
 * Triggers the browser's print dialog, which lets the user "Save as PDF".
 * This gives a working, always-up-to-date resume download without shipping
 * a separate binary PDF file.
 */
export function PrintButton({ label = "Download PDF" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary">
      <Printer className="h-4 w-4" /> {label}
    </button>
  );
}
