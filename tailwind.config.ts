import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563EB", 50: "#eff6ff", 100: "#dbeafe", 500: "#2563EB", 600: "#1d4ed8", 700: "#1e40af" },
        secondary: { DEFAULT: "#0F172A", light: "#1e293b" },
        accent: { DEFAULT: "#38BDF8", soft: "#7dd3fc" },
      },
      fontFamily: { sans: ["var(--font-inter)", "system-ui", "sans-serif"] },
      boxShadow: {
        glow: "0 0 24px -4px rgba(56, 189, 248, 0.35)",
        card: "0 4px 24px -8px rgba(0, 0, 0, 0.25)",
      },
      keyframes: {
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
      },
      animation: { float: "float 6s ease-in-out infinite" },
    },
  },
  plugins: [],
};

export default config;
