import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://subhajeetmohanty90.github.io/subhajeet-portfolio/sitemap.xml",
  };
}
