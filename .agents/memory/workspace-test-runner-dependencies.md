---
name: Workspace test runner dependencies
description: Package-local test commands need direct declarations for their Node and TypeScript loaders.
---

The workspace package that runs a Node-based test must declare its test loader as a direct development dependency; another workspace package having the same binary is not enough for ESM module resolution.

**Why:** pnpm keeps workspace dependency links package-scoped, so a command can expose a binary while `node --import` still cannot resolve that package from the current package.

**How to apply:** Add the loader to the executing package using the workspace catalog and keep its lockfile importer entry in sync.