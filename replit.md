# Follow Jesus Online

Follow Jesus Online is a discipleship destination in the JesusOnline family, beginning with a secure, accessible NET Bible reader.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the shared API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/api-server run test:auth` — authentication regressions, including isolated PostgreSQL tests

### Reaction admin security

- The Express API requires a nonblank `SESSION_SECRET` at startup. Use a randomly generated, high-entropy secret and admin password. Changing the signing secret invalidates existing admin sessions and changes visitor reaction hashes.
- Apply the additive `lib/db/migrations/20261003-admin-login-attempts.sql` to the API's existing PostgreSQL database before running this version (or use the standard Drizzle schema push). Without the table or database access, admin login returns 503; it never falls back to an in-memory limiter.
- Admin login has an atomic, persistent, account-wide budget of 10 attempts per 15 minutes, including successful and invalid login requests. This intentionally prevents IP rotation or instance recycling from increasing the budget. Exhaustion returns 429 with `Retry-After`; blocked requests do not extend the window. The tradeoff is that repeated attempts can temporarily prevent the legitimate admin from logging in; already authenticated sessions remain usable.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

- A Scripture reader with direct, shareable book-and-chapter URLs.
- The NET Bible is retrieved through the official Bible.org service; it is not hosted as a local Bible-text database.
- The reader must retain the NET attribution and outbound netbible.org link.
- Internal links to a different page, including between chapters, must open the destination at the top. Deliberate in-page anchors and direct Bible verse anchors should still reach their targets.
- The Go Further library, all five book pages, their readings, and A Heart After God's introduction share the Adventure Guide's warm-paper, narrow-column book presentation. Keep this chapter framing distinct from Go Deeper and unrelated article groups.
- Every article (including Go Further intro/readings) uses the same footer treatment shown in the approved Adventure chapter: compact “Was this helpful?” vote, mapped reading navigation, compact message card, and NET Scripture notice, in that order. Preserve the blue next-chapter/reading card with narrow orange top accent, white optional Go Deeper/back-to-chapter card, and small previous-chapter/reading text link where those destinations are actually mapped. Do not invent navigation or substitute generic Explore links when a next chapter/reading or companion is missing; omit that card. See `article-footer-link-gaps.md` for the current inventory.
- Go Deeper companions link forward to the next Guide chapter and back to their currently mapped Guide chapter; never chain them to other Go Deeper articles. When there is no next Guide chapter, do not display a forward card.
- The legacy Go Deeper pages “Assurance of Your Salvation,” “Faith: Knowing Whom You Can Trust,” “Spiritual Breathing,” and “How to Experience God’s Forgiveness,” and the More to Explore resources “The Holy Spirit,” “The Bible,” “Struggling with Destructive Behavior?,” and “Fleeing Temptation” are retired from the public catalog. Do not list or link to them without explicit editorial approval. The imported ALJ companion “Faith: Knowing God Who Is Trustworthy” is distinct and remains published; references to spiritual breathing as a concept in Guide content remain.

## Typography

- Use Playfair Display sparingly for hero and page-title H1 treatments at weight 600–700; H2–H6 use Source Sans 3.
- A short phrase may use Playfair Display italic, but avoid setting whole titles in italic.
- Never use Playfair Display for navigation, menus, labels, buttons, H3 headings, or general interface text.
- Use Source Sans 3 for navigation, menus, labels, buttons, H3 headings, and body copy. Navigation should generally use weight 500–600 for clarity.
- Treat the supplied typography role sheet as the visual model for future work.

## Color

- The approved blue family is limited to `#003A66`, `#004E8A`, `#006BB3`, `#007AE0`, `#0095FF`, `#1AA3FF`, `#33ADFF`, `#0084E6`, `#66C2FF`, `#99D6FF`, `#CCEBFF`, `#E6F5FF`, `#4A90B8`, `#5B9BC4`, and `#2E5A7A`.
- `#0095FF` is the main brand color and menu-bar blue. Use one bright blue per screen or composition.
- Use `#006BB3` as the default large hero-surface blue; reserve `#0095FF` for smaller brand signals rather than page-sized fields.
- Use navy for structure, pale blue for space, and muted/slate blue for secondary UI.
- Warm orange/gold is the only non-blue accent family. Its anchor is `#E87722`, used sparingly for warmth, invitation, and decorative emphasis.
- Text-bearing orange actions use the deeper `#C45100` with white text for accessible contrast; do not place normal white text on `#E87722`.
- Treat `deliverables/follow-jesus-online-color-standards.pdf` as the authoritative long-term palette and role guide for future work.

## User preferences

- Never publish or deploy this project.
- Never push, commit, open a pull request, or otherwise write to Git remotes. The user handles staging and production promotion.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
