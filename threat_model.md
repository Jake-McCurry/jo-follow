# Threat Model

## Project Overview

Follow Jesus Online is a discipleship/Scripture-reader web product built as a pnpm
monorepo (Node.js 24, TypeScript 5.9). It has three deployable artifacts:

- `artifacts/api-server` — a small Express 5 JSON API (the only server-side trust
  boundary). Routes: Bible passage proxy, article reactions (public voting), and a
  password-gated "reaction admin" report.
- `artifacts/follow-jesus-online` — a static Vite/React front end (Wouter router,
  shadcn/ui). Mostly static content; fetches Bible text and reactions from the API.
- `artifacts/mockup-sandbox` — design/mockup artifact (dev-only, `/__mockup`).

Persistence is PostgreSQL via Drizzle ORM (`lib/db`). The only table is
`article_reactions` (article slug, visitor hash, reaction enum). There are **no user
accounts, no PII storage, and no payment/billing surface.** Bible text is proxied
from external services (labs.bible.org NET, bible-api.com KJV).

Deployment: autoscale, visibility **private** (Replit infrastructure gates public
internet access in this state).

## Assets

- **Reaction admin session / password** (`REACTIONS_ADMIN_PASSWORD`, `SESSION_SECRET`)
  — gate the private aggregate-reaction report.
- **Aggregate reaction statistics** — low-sensitivity engagement counts per article,
  including `disagree` and sub-threshold counts not shown publicly.
- **Database connection string** (`DATABASE_URL`) — server-only secret.
- Bible text content is public and non-sensitive.

## Trust Boundaries

- **Browser → API** (`/api/*`): all client input is untrusted. Enforced with Zod
  schemas on params/query/body and a global in-memory rate limiter.
- **API → PostgreSQL**: Drizzle parameterized queries only; no raw string SQL.
- **API → external Bible services**: outbound fetch with fixed hosts, an input
  character allowlist (`REFERENCE_PATTERN`), and `encodeURIComponent` on the path.
- **Public visitor → admin report**: the only privilege boundary. Enforced by an
  HMAC-signed cookie (`jo_reaction_admin`) minted after a password check.

## Scan Anchors

- Production entry points: `artifacts/api-server/src/app.ts`, `routes/*.ts`.
- Highest-risk code: `artifacts/api-server/src/routes/reactions.ts` (the only auth
  logic — HMAC session minting/verification, password check, admin stats).
- Outbound-request logic: `artifacts/api-server/src/lib/bible.ts`.
- Public surfaces: `/api/healthz`, `/api/bible/*`, `GET/PUT /api/articles/:slug/reactions`.
- Admin surface: `/api/reaction-admin/*`.
- Dev-only / ignore unless proven reachable: `artifacts/mockup-sandbox`, `scripts/`,
  `attached_assets/`, `screenshots/`, generated client code under `lib/api-client-react`
  and `lib/api-zod` (codegen output).

## Threat Categories

### Spoofing / Elevation of Privilege

The sole privilege boundary is the reaction-admin report. The HMAC session uses
`process.env.SESSION_SECRET ?? ""`. If `SESSION_SECRET` is unset, the signing key is
the empty string and anyone can forge a valid admin cookie without the password
(fail-open). Guarantee: session signing MUST fail closed when the secret is missing,
and the secret MUST be configured in production.

### Tampering / Injection

All DB access is parameterized via Drizzle; the only table has no privileged columns.
Outbound Bible requests restrict the reference to `^[A-Za-z0-9\s:;,\-]+$`, cap length
at 100, and URL-encode the path — no SSRF or injection path observed. Reaction writes
are keyed to a server-derived visitor hash; a visitor can only change their own vote.

### Information Disclosure

Public reaction summaries suppress counts below a threshold of 5; the admin report
exposes exact and sub-threshold counts. This data is low-sensitivity engagement
telemetry (no PII). Error responses are generic.

### Denial of Service

Rate limiting is in-memory per instance (`middlewares/public-api.ts`). Under autoscale
the effective limit scales with instance count, weakening brute-force / abuse
protection, but body size is capped (32kb) and external fetches have timeouts.
