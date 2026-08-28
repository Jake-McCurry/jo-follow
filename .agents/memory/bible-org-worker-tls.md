---
name: Bible.org Worker TLS checks
description: How to interpret local Wrangler TLS failures when validating NET Bible passage requests.
---

Local Wrangler's `workerd` can reject `labs.bible.org` with an untrusted local issuer error even while the same HTTPS request succeeds from the host and the Node API server.

**Why:** The local Cloudflare runtime uses a different certificate trust store. This can make a correctly routed Worker passage request return 502 during local testing without proving that Cloudflare's deployed runtime will fail.

**How to apply:** Validate routing, JSON errors, assets, and book data locally. After a staging deployment, verify at least one real passage through the deployed Worker before treating the feature as complete.

Cloudflare managed verification can run before the Worker and challenge API clients while a real browser succeeds after solving the challenge; Worker response code cannot bypass that edge rule.

**Why:** The staging Bible UI can render correctly while direct `/api/bible/*` smoke checks still receive an HTML 403 challenge, so the fix belongs in the Cloudflare zone/security configuration.

**How to apply:** Exempt only `/api/bible/*` (or the trusted validator identity) from the managed challenge, then re-run both direct JSON checks and the browser page check.