# Subhajeet Mohanty - Performance Engineering Portfolio

A modern, interview-focused portfolio built with Next.js 14 (App Router), TypeScript,
Tailwind CSS, Framer Motion and Lucide icons. Dark mode default with a light theme toggle.

## Features
- Home with animated stat counters and business-impact cards
- About, Skills & Tools, Achievements timeline
- Deep-dive Case Studies with before/after KPIs
- Expandable Performance War Stories
- Certifications, Resume viewer, Contact form
- "Top 10 Performance Engineering Success Stories" interviewer page
- Global search (Ctrl/Cmd + K)
- SEO metadata, sitemap.xml, robots.txt
- Fully responsive + accessible

## Tech Stack
Next.js, TypeScript, Tailwind CSS, Framer Motion, Lucide, next-themes.

## Getting Started
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Customize
- Edit all content in `lib/data.ts` (profile, stats, case studies, war stories, etc.)
- Add your photo: place `public/profile.jpg` and render it in `app/page.tsx` hero
- Add your resume: place `public/resume.pdf`
- Add certificates: place PDFs under `public/certs/`
- Update social links and email in `lib/data.ts`
- Update the production URL in `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`

## Build
```bash
npm run build
npm start
```

## Deploy to Vercel (free)
1. Push this folder to a GitHub repository.
2. Go to https://vercel.com and click "New Project".
3. Import the GitHub repo. Vercel auto-detects Next.js.
4. Framework Preset: Next.js. Build command `next build`. Output: default.
5. Click "Deploy". Your site goes live at `https://<project>.vercel.app`.
6. (Optional) Add a custom domain in Project Settings > Domains.

Alternatively with the CLI:
```bash
npm i -g vercel
vercel
vercel --prod
```

## Project Structure
```
app/            App Router pages (home, about, skills, ...)
components/     Reusable UI (Navbar, Footer, Counter, SearchModal, ...)
lib/data.ts    Single source of truth for all content
public/         Static assets (resume.pdf, profile.jpg, certs/)
```

Designed and built to showcase real-world Performance Engineering excellence.
