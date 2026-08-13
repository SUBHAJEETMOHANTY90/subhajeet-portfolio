import type { MetadataRoute } from "next";
import { navLinks } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://subhajeetmohanty90.github.io/subhajeet-portfolio";
  return navLinks.map((l) => ({
    url: `${base}${l.href === "/" ? "" : l.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: l.href === "/" ? 1 : 0.8,
  }));
}
