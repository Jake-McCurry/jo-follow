# Follow Jesus Online

Follow Jesus Online is a discipleship destination in the JesusOnline family, beginning with a secure, accessible NET Bible reader.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the shared API server
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

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
