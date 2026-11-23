import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { loadConfigFromFile } from "vite";

const root = path.resolve(import.meta.dirname, "..");
const metadata = JSON.parse(readFileSync(path.join(root, "src/data/prayer-articles.json"), "utf8"));
const lordsMetadata = JSON.parse(readFileSync(path.join(root, "src/data/lords-prayer-articles.json"), "utf8"));
const expected = JSON.parse(execFileSync("python3", [
  path.join(root, "scripts/prayer-source-extract.py"),
  path.resolve(root, "../../attached_assets/OneDrive_2026-10-14_1792010333357.zip"),
], { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 }));
const revisedLords = JSON.parse(execFileSync("python3", [
  path.join(root, "scripts/prayer-source-extract.py"),
  path.resolve(root, "../../attached_assets/OneDrive_2026-11-23_(1)_1795469072483.zip"),
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
  assert.equal(Object.keys(expected).length, 21);
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

test("all eleven revised Lord’s Prayer documents retain every word as text, without text images", () => {
  const lords = records.filter(record => record.category === "Lords Prayer");
  assert.equal(lords.length, 11);
  let imageCount = 0;
  for (const item of lordsMetadata) {
    const record = lords.find(record => record.route === `/${item.slug}`);
    assert.ok(record, item.slug);
    assert.equal(record.title, item.title);
    assert.deepEqual(record.blocks.filter(block => block.kind !== "image").map(block => block.text),
      revisedLords[item.prefix].paragraphs, item.title);
    assert.deepEqual(record.blocks.filter(block => block.kind === "image").map(block => {
      const asset = assets.find(asset => asset.fileName === `article-images/${block.src}`);
      assert.ok(asset, block.src);
      assert.ok(block.text.length > 20);
      imageCount++;
      return createHash("sha256").update(asset.source).digest("hex");
    }), revisedLords[item.prefix].images, item.title);
  }
  assert.equal(imageCount, 0);
});

test("Worship, Dedication and Guidance introductions use paragraphs, not accidental source headings", () => {
  for (const suffix of ["worship", "dedication", "guidance"]) {
    const article = records.find(record => record.route === `/lords-prayer-${suffix}`);
    const end = article.blocks.findIndex(block => block.text === "Speak this first");
    const focus = article.blocks.findIndex(block => block.text.startsWith("Focus on "));
    assert.ok(end > focus);
    const opening = article.blocks.slice(focus + 1, end);
    assert.equal(opening.length, 2);
    assert.ok(opening.every(block => block.kind === "paragraph"), suffix);
  }
});

test("overview preserves all 24 live-text panels and their eight local deeper-reading links", () => {
  const overview = records.find(record => record.category === "Lords Prayer" && record.route === "/deeper-the-lords-prayer-guide");
  for (const label of ["SCRIPTURE", "REFLECT", "A PRAYER"]) {
    const panels = overview.blocks.filter(block => block.kind === "heading" && block.text === label);
    assert.equal(panels.length, 8, label);
    for (const panel of panels) {
      const body = overview.blocks[overview.blocks.indexOf(panel) + 1];
      assert.equal(body.kind, "paragraph");
      assert.ok(body.text.length > 20);
    }
  }
  const deeper = overview.blocks.flatMap(block => block.links ?? [])
    .filter(link => link.label.startsWith("GO DEEPER"));
  assert.deepEqual(deeper.map(link => link.href), lordsMetadata.filter(item => item.legacyPostId).map(item => item.href));
});

test("the Lord’s Prayer overview links all eight topics locally in roadmap order", () => {
  const overview = records.find(record => record.category === "Lords Prayer" && record.route === "/deeper-the-lords-prayer-guide");
  const topics = overview.blocks.filter(block => block.kind === "heading" && block.links?.length);
  assert.deepEqual(topics.map(block => block.links[0].href),
    lordsMetadata.filter(item => item.legacyPostId).map(item => item.href));
  assert.equal(new Set(lordsMetadata.map(item => item.href)).size, 11);
  assert.ok(!overview.blocks.flatMap(block => block.links ?? []).some(link =>
    /app\.jesusonline\.com\/post\/(?:23311|23321|23331|23341|23351|23361|23371|23401)-/.test(link.href)));
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
