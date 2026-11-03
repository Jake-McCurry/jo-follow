---
name: Uploaded build inputs
description: Prevent locally available source uploads from breaking Cloudflare builds after a Git push.
---

Any upload consumed by a production builder or required source-parity test must be included in the Git checkout or provisioned through an explicit durable build-input mechanism.

**Why:** The environment has a global ignore for uploaded assets. A new Because statements ZIP was available in the Replit preview but absent from GitHub, so Cloudflare's prebuild source check failed and the live site retained its older content. A successful local test alone did not establish CI portability.

**How to apply:** For small source archives following this project's existing build convention, explicitly unignore the exact required file in the repository's ignore rules. Verify it appears as trackable with Git status, then run source checks and the production asset build. Do not weaken or skip source-fidelity tests to hide missing inputs. Keep large assets out of Git and provide a separate durable build-input approach for them.
