// When deploying to GitHub Pages under https://<user>.github.io/<repo>,
// the site is served from a sub-path. The GitHub Actions workflow sets
// NEXT_PUBLIC_BASE_PATH to "/<repo>" so links and assets resolve correctly.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "export", // generate a fully static site in ./out
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  basePath,
  images: {
    // next/image optimization is not available on static hosts like GitHub Pages
    unoptimized: true,
  },
  trailingSlash: true, // ensures clean folder-based routing on GitHub Pages
};
export default nextConfig;
