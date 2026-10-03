import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin.ts";

async function generate(root) {
  const plugin = mockupPreviewPlugin();
  plugin.configResolved({ root });
  await plugin.buildStart();
  return readFile(path.join(root, "src/.generated/mockup-components.ts"), "utf8");
}

test("discovery preserves nested TSX previews and excludes private, hidden, and other files", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "mockup-discovery-"));
  try {
    const files = [
      "Welcome.tsx",
      "nested/Details.tsx",
      "_Private.tsx",
      "_private/Hidden.tsx",
      "nested/_internal/Hidden.tsx",
      "nested/_Helper.tsx",
      ".Hidden.tsx",
      ".hidden/Hidden.tsx",
      "nested/.hidden/Hidden.tsx",
      "notes.ts",
    ];
    for (const file of files) {
      const target = path.join(root, "src/components/mockups", file);
      await mkdir(path.dirname(target), { recursive: true });
      await writeFile(target, "export default function Preview() { return null; }\n");
    }
    const source = await generate(root);
    assert.match(source, /"\.\/components\/mockups\/Welcome\.tsx"/);
    assert.match(source, /"\.\/components\/mockups\/nested\/Details\.tsx"/);
    assert.match(source, /import\("\.\.\/components\/mockups\/nested\/Details\.tsx"\)/);
    assert.equal((source.match(/: \(\) => import/g) ?? []).length, 2);
    assert.doesNotMatch(source, /Private|Hidden|Helper|notes/);
    assert.equal(await generate(root), source);

    await rm(path.join(root, "src/components/mockups/Welcome.tsx"));
    await writeFile(path.join(root, "src/components/mockups/New.tsx"), "export default {};");
    const refreshed = await generate(root);
    assert.doesNotMatch(refreshed, /Welcome/);
    assert.match(refreshed, /New\.tsx/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("discovery generates an empty map when the mockup directory is missing", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "mockup-empty-"));
  try {
    const source = await generate(root);
    assert.match(source, /export const modules: ModuleMap = \{\n\n\};/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});