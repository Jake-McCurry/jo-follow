---
name: Bible.org Worker TLS checks
description: How to interpret local Wrangler TLS failures when validating NET Bible passage requests.
---

Local Wrangler's `workerd` can reject `labs.bible.org` with an untrusted local issuer error even while the same HTTPS request succeeds from the host and the Node API server.

**Why:** The local Cloudflare runtime uses a different certificate trust store. This can make a correctly routed Worker passage request return 502 during local testing without proving that Cloudflare's deployed runtime will fail.

**How to apply:** Validate routing, JSON errors, assets, and book data locally. After a staging deployment, verify at least one real passage through the deployed Worker before treating the feature as complete.