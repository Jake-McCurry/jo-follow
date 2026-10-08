import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { loadConfigFromFile } from "vite";

const root = path.resolve(import.meta.dirname, "..");
const metadata = JSON.parse(readFileSync(path.join(root, "src/data/prayer-articles.json"), "utf8"));
const expected = JSON.parse(execFileSync("python3", [
  path.join(root, "scripts/prayer-source-extract.py"),
  path.resolve(root, "../../attached_assets/OneDrive_2026-10-08_1791498971259.zip"),
], { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 }));
const config = await loadConfigFromFile({ command: "build", mode: "production" }, path.join(root, "vite.config.ts"));
const plugin = config.config.plugins.flat().find(item => item?.name === "jolf-article-content");
assert.ok(plugin);
const source = await plugin.load("\0virtual:article-content");
const records = JSON.parse(source.replace(/^export default /, "").replace(/;$/, ""));
const assets = [];
plugin.generateBundle.call({ emitFile: asset => assets.push(asset) });
const prayers = records.filter(record => record.category === "Prayer");

test("all ten prayer documents retain every source paragraph and all six original images", () => {
  assert.equal(prayers.length, 10);
  assert.equal(Object.keys(expected).length, 10);
  let imageCount = 0;
  for (const item of metadata) {
    const article = prayers.find(record => record.route === `/${item.slug}`);
    assert.ok(article, item.slug);
    assert.equal(article.title, item.title);
    assert.deepEqual(article.blocks.filter(block => block.kind !== "image").map(block => block.text),
      expected[item.prefix].paragraphs, item.title);
    const images = article.blocks.filter(block => block.kind === "image");
    assert.deepEqual(images.map(block => {
      const asset = assets.find(asset => asset.fileName === `article-images/${block.src}`);
      assert.ok(asset, block.src);
      assert.ok(block.text.length > 20, "Each summary image needs descriptive alternative text");
      return createHash("sha256").update(asset.source).digest("hex");
    }), expected[item.prefix].images, item.title);
    imageCount += images.length;
  }
  assert.equal(imageCount, 6);
});

test("the starter guide links to all nine readings in the supplied guide order", () => {
  const guide = prayers.find(record => record.route === "/prayer-starter-guide");
  const hrefs = guide.blocks.flatMap(block => block.links?.map(link => link.href) ?? []);
  assert.deepEqual(hrefs, metadata.filter(item => item.order > 0).map(item => item.href));
  assert.equal(new Set(metadata.map(item => item.slug)).size, 10);
  assert.equal(new Set(metadata.map(item => item.href)).size, 10);
  assert.ok(records.some(record => record.route === "/adv-prayer" && record.category === "ZIP Updated"),
    "Keep the separate Adventure Guide prayer chapter");
});
