import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { reactionArticleSlugs } from "../scripts/reaction-article-catalog.mjs";

const dir = await mkdtemp(join(tmpdir(), "reaction-auth-"));
try {
  const sessionFile = join(dir, "session.cjs");
  const testFile = join(dir, "auth.test.cjs");
  const probeFile = join(dir, "limit-probe.cjs");
  const options = {
    bundle: true,
    platform: "node",
    format: "cjs",
    external: ["pg-native"],
    define: { __REACTION_ARTICLE_SLUGS__: JSON.stringify(await reactionArticleSlugs()) },
  };
  await build({ ...options, entryPoints: ["src/lib/admin-session.ts"], outfile: sessionFile });
  await build({ ...options, entryPoints: ["tests/auth.test.ts"], outfile: testFile });
  await build({ ...options, entryPoints: ["tests/limit-probe.ts"], outfile: probeFile });
  const schema = `auth_test_${randomUUID().replaceAll("-", "")}`;
  const result = spawnSync(process.execPath, ["--test", testFile], {
    stdio: "inherit",
    env: {
      ...process.env,
      SESSION_SECRET: "synthetic-session-secret-for-regression-tests",
      REACTIONS_ADMIN_PASSWORD: "synthetic-test-password",
      AUTH_SESSION_TEST_MODULE: sessionFile,
      AUTH_LIMIT_TEST_MODULE: probeFile,
      AUTH_TEST_SCHEMA: schema,
      // Set before any DB imports; never allow fallback to application tables.
      PGOPTIONS: `-c search_path=${schema}`,
    },
  });
  process.exitCode = result.status ?? 1;
} finally {
  await rm(dir, { recursive: true, force: true });
}