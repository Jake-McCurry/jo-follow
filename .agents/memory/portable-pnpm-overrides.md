---
name: Portable pnpm overrides
description: Cloudflare frozen-install compatibility for this pnpm workspace.
---

Keep cross-platform dependency overrides minimal and define meaningful overrides in the root package configuration rather than using a large Replit-only platform exclusion list.

**Why:** Cloudflare's pnpm 10.11.1 rejected the workspace-level platform override map as inconsistent with the frozen lockfile even though the same checkout passed locally.

Do not pin pnpm with the root `packageManager` field in this Replit workspace; the local pnpm shim may repeatedly attempt to self-install that version and prevent managed workflows from starting.

Keep a project-local Wrangler configuration checked in for Cloudflare deployments from a workspace package. Without it, Wrangler's automatic Vite setup invokes npm, which cannot resolve pnpm `catalog:` dependencies.

**How to apply:** After changing override configuration, regenerate the lockfile with Cloudflare's pnpm version via Corepack and verify both `install --frozen-lockfile` and the targeted production build. Run Wrangler with `--cwd` pointing to the artifact directory.