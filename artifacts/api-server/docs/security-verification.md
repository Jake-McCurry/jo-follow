# Security verification — 2026-10-03

## Scope

These checks ran against the development app's proxied origin, not a published
deployment. The supplemental HTTP probes used invalid inputs and read-only
requests; they did not create or remove reactions, read secrets, or change accounts.
They are targeted checks, not a guarantee that the application has no vulnerabilities.

## Remediated findings

- Malformed JSON and oversized bodies previously returned Express development
  error pages containing stack traces and internal paths. A final API error
  handler now sends generic JSON responses with appropriate 400/413/415/500
  statuses. Unexpected error logging excludes error messages and request bodies,
  which can contain passwords. Unknown API endpoints also return generic JSON.
- Vite's default workspace-wide file allowance exposed backend TypeScript through
  `/@fs/`. Both frontend and component-preview servers now allow only the
  directories needed for their browser modules and assets. Backend code, database
  modules, and private workspace memory return 403, including raw-file requests.
  This is a development-preview hardening measure, not a claim that a static
  production build had the same exposure.

## Verification performed

- Dependency audit: zero critical, high, moderate, low, or informational advisories.
- `node --test artifacts/api-server/tests/api-errors.test.mjs`: two tests passed,
  covering parser errors, large bodies, invalid encodings, unexpected server
  errors, normal requests, and already-started responses. Checked both development
  and production environments.
- API TypeScript check passed; the managed API workflow rebuilt successfully.
- Nineteen live HTTP checks passed:
  - Anonymous admin report access and an empty-key-signed forged cookie: 401.
  - Malformed JSON: 400; oversized JSON: 413; invalid charset: 415.
  - Invalid Bible reference and invalid reaction value: 400.
  - Unknown API endpoint: 404 JSON.
  - Backend source, raw backend source, database source, and private memory
    through the frontend Vite server: 403.
  - Backend source and private memory through the component-preview server: 403.
  - Promises, Knowing God, Promises book data, a public article image, and the
    frontend entry module: 200.
- Cross-origin preflight did not grant an untrusted origin API access.
- Promises screenshot confirmed the reader still renders without browser errors
  after tightening file access.

## Separately managed work

The authentication/session-secret and admin-login throttling remediation was
awaiting merge during these checks. A separate black-box finding concerning
reaction writes for nonexistent article slugs was being remediated.
The HTTP cookie rejection above does not prove that the missing-secret condition
has been fixed: the running development environment already has a configured key.
Post-merge checks are needed for those independently implemented fixes.