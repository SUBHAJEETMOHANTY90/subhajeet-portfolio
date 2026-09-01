"use client";
import { useEffect } from "react";

/**
 * Renders a verified Credly badge.
 * Credly's embed.js scans the page for elements with `data-share-badge-id`
 * and replaces them with an iframe showing the badge.
 */
export function CredlyBadge({
  badgeId,
  width = 150,
  height = 270,
}: {
  badgeId: string;
  width?: number;
  height?: number;
}) {
  useEffect(() => {
    const SRC = "https://cdn.credly.com/assets/utilities/embed.js";
    // (Re)load the script so the badge renders on client-side navigation too.
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.src = SRC;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div
      data-iframe-width={width}
      data-iframe-height={height}
      data-share-badge-id={badgeId}
      data-share-badge-host="https://www.credly.com"
    />
  );
}
