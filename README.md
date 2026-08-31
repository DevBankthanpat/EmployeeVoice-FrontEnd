# Employee Voice

**Organizational Signal Intelligence Platform** — POC (single organization).

Employees submit organizational "signals" (issues, friction, positive observations)
through a form. An AI process periodically summarizes, classifies, clusters, and
recommends actions. The organization sees an aggregated dashboard — with
**structural anonymity guarantees** so individual submitters can never be identified.

> **Core promise:** the dashboard must never be able to infer *who* submitted a signal.

This is the **frontend** package of the monorepo (see the [root README](../README.md)).
System design, data model, and privacy rules live in [`ARCHITECTURE.md`](../ARCHITECTURE.md);
the phased build plan in [`implementation_plan.md`](../implementation_plan.md); contributor
guidance in [`CLAUDE.md`](../CLAUDE.md) — all at the repo root.

---

## Tech stack

- **Framework:** Next.js 16 (App Router) + TypeScript (strict)
- **Styling:** Tailwind CSS v4 (CSS-first tokens) + shadcn/ui
- **State/data:** TanStack Query · **Validation:** Zod · **Charts:** Recharts · **Icons:** Lucide
- **i18n:** next-intl (Thai default, English) — cookie-based locale
- **Backend (Phase 6+):** Go + Postgres + Anthropic Claude API (server-side)

Frontend runs entirely on mock data until the backend lands (`USE_MOCK`, default on).

## Getting started

Requires Node.js 20+ and npm.

```bash
npm install
cp .env.example .env   # defaults are fine for local dev
npm run dev            # http://localhost:3000
```

## Environment

Copy `.env.example` → `.env` (gitignored). Key flag:

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_USE_MOCK` | `true` | `true` = in-memory mock provider; `false` = real API (Phase 9+) |

The AI API key and other secrets are **server-side only** and are added from Phase 6.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint (flat config, Next + Prettier compat) |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run format` | Prettier (with Tailwind class sorting) |

## Project structure

```
src/
  app/          Route groups: (auth) (employee) (org) (admin) profile — scaffolded, filled per phase
  components/   ui/ (shadcn) · dashboard/ · form/ · layout/
  data/         provider.ts (the one data abstraction) · mock/ · schemas/ (Zod)
  i18n/         config.ts (client-safe) · request.ts (locale from cookie)
  lib/          env.ts (USE_MOCK) · utils.ts (cn)
  messages/     th.json · en.json
```

Design tokens ("Calm Enterprise / Trust-first", teal `#368B89`) live in
`src/app/globals.css` under `@theme` — Tailwind v4 has no `tailwind.config.js`.

## Build status

Phased build (see [`implementation_plan.md`](../implementation_plan.md)):

- ✅ **Phases 0–5** — Frontend on mock data (setup, schemas, auth/layout, employee portal, dashboard, org management)
- ⬜ Phases 6–10 — Backend, endpoints, AI worker, integration, hardening
