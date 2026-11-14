# DFIR Chronos

Interactive, methodology-first **Digital Forensics & Incident Response** lab — Module 1:
**Timeline Reconstruction via Artifact Correlation** (Windows host forensics:
$UsnJrnl, Shimcache, SQLite WAL).

Part of a four-lab DFIR portfolio: each module walks from collection to a
defensible conclusion, with real tooling and artifacts.

**Live:** see the Vercel deployment linked to this repo.

## Stack

Next.js 15 (App Router) · TypeScript (strict) · Tailwind CSS 4 · shadcn/ui · Lucide icons · Framer Motion

## Modules

| # | Module | Route |
|---|--------|-------|
| 01 | Timeline Reconstruction via Artifact Correlation | `/modules/timeline` |
| 02 | Memory Forensics *(planned)* | — |
| 03 | Network Traffic Analysis *(planned)* | — |
| 04 | Linux Server Investigation *(planned)* | — |

## Getting started

```bash
npm install
npm run dev
```

Quality gates (must pass before committing):

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Legal & ethics

For educational use only. Labs run on isolated images — do not test techniques
on systems you do not own or have written authorization to assess.
