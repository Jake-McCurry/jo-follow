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

Persistence is PostgreSQL via Drizzle ORM (`lib/db`). Tables include
`article_reactions` (article slug, visitor hash, reaction enum) and
`admin_login_attempts` (fixed admin account scope, attempt count, reset time).
There are **no user
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
- **API → PostgreSQL**: Drizzle parameterized queries, including the atomic
  admin login-budget upsert. No attacker-supplied SQL identifiers.
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

The sole privilege boundary is the reaction-admin report. The API validates
`SESSION_SECRET` before accepting requests and refuses startup when it is missing,
empty, or whitespace-only. HMAC sessions reject malformed, expired, tampered, and
empty-key-forged tokens. A missing admin password returns 503. Use high-entropy
signing secrets and passwords; changing the signing secret invalidates sessions.

### Tampering / Injection

Runtime DB access is parameterized via Drizzle. Article reactions have no privileged
columns; the admin login-budget table is server-controlled and not publicly writable.
Outbound Bible requests restrict the reference to `^[A-Za-z0-9\s:;,\-]+$`, cap length
at 100, and URL-encode the path — no SSRF or injection path observed. Reaction writes
are keyed to a server-derived visitor hash; a visitor can only change their own vote.

### Information Disclosure

Public reaction summaries suppress counts below a threshold of 5; the admin report
exposes exact and sub-threshold counts. This data is low-sensitivity engagement
telemetry (no PII). Error responses are generic.

### Denial of Service

General public API rate limiting remains in-memory per instance
(`middlewares/public-api.ts`), so its effective limit scales with instance count.
Body size is capped (32kb) and external fetches have timeouts.

Admin login additionally consumes an atomic, persistent PostgreSQL account-wide
budget of 10 attempts per 15 minutes. All instances share this budget; IP rotation
and process recycling do not reset it. Blocked requests return 429 with Retry-After
without extending the window. If the table/database is unavailable, login returns
503 without issuing a cookie. Repeated attempts can temporarily deny legitimate
admin login; existing authenticated sessions remain usable.

Authentication regressions run with a dedicated test schema as the sole search
path, including independent-process probes. Missing test tables must never resolve
to real application tables. Tests verify the real admin login budget is unchanged.
