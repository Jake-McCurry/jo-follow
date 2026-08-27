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

## User preferences

- Never publish or deploy this project.
- Never push, commit, open a pull request, or otherwise write to Git remotes. The user handles staging and production promotion.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
