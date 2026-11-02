import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { profile } from "@/lib/data";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Visitor counts and countries via GoatCounter: no cookies, so no consent
// banner. Set at build time from the GOATCOUNTER_CODE repository variable;
// when it is unset (e.g. local dev) the script is not rendered at all.
const goatCounterCode = process.env.NEXT_PUBLIC_GOATCOUNTER_CODE;

export const metadata: Metadata = {
  metadataBase: new URL("https://subhajeet-portfolio.vercel.app"),
  title: {
    default: `${profile.name} | Performance Engineering Portfolio`,
    template: `%s | ${profile.name}`,
  },
  description: profile.summary,
  keywords: [
    "Performance Engineering", "Performance Testing", "JMeter", "LoadRunner",
    "Dynatrace", "AppDynamics", "Capacity Planning", "Scalability", "AWS",
    "Kubernetes", "JVM Tuning", "Subhajeet Mohanty",
  ],
  authors: [{ name: profile.name }],
  creator: profile.name,
  openGraph: {
    type: "website",
    title: `${profile.name} | Performance Engineering Portfolio`,
    description: profile.summary,
    siteName: profile.name,
  },
  twitter: { card: "summary_large_image", title: profile.name, description: profile.tagline },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
        {goatCounterCode && (
          <Script
            data-goatcounter={`https://${goatCounterCode}.goatcounter.com/count`}
            src="https://gc.zgo.at/count.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
