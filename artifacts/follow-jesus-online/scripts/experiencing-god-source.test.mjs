import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { loadConfigFromFile } from "vite";
import { getGFBook } from "../src/data/go-further-library.ts";

const root = path.resolve(import.meta.dirname, "..");
const metadata = JSON.parse(readFileSync(path.join(root, "src/data/experiencing-god-articles.json"), "utf8"));
const lordsMetadata = JSON.parse(readFileSync(path.join(root, "src/data/lords-prayer-articles.json"), "utf8"));
// Reuse the independent nested-DOCX text extractor, not the Vite parser being tested.
const expected = JSON.parse(execFileSync("python3", [
  path.join(root, "scripts/prayer-source-extract.py"),
  path.resolve(root, "../../attached_assets/Experiencing_God_2026-10-14_1792009307040.zip"),
], { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 }));
const config = await loadConfigFromFile({ command: "build", mode: "production" }, path.join(root, "vite.config.ts"));
const plugin = config.config.plugins.flat().find(item => item?.name === "jolf-article-content");
const generated = await plugin.load("\0virtual:article-content");
const records = JSON.parse(generated.replace(/^export default /, "").replace(/;$/, ""))
  .filter(record => record.category === "Experiencing God");

test("all eight documents retain their full headings, subtitles and complete source text", () => {
  assert.equal(metadata.length, 8);
  assert.equal(records.length, 8);
  assert.equal(Object.keys(expected).length, 8);
  for (const item of metadata) {
    const source = Object.entries(expected).find(([key]) => key.startsWith(item.prefix))?.[1];
    assert.ok(source, item.prefix);
    const record = records.find(record => record.route === `/${item.slug}`);
    assert.equal(record.title, source.paragraphs[0]);
    const expectedText = source.paragraphs.map(text =>
      text.replace(/\s*\[Note to Jake: [^\]]+\]/g, "").replace(/\s*>{3}\s*$/, "").trim());
    if (item.appendedResourcesHeading) expectedText.push(item.appendedResourcesHeading, ...item.pendingLinks.map(link => link.label));
    assert.deepEqual(record.blocks.map(block => block.text), expectedText);
    assert.ok(record.blocks.length > 15);
    assert.ok(!record.blocks.some(block => /Note to Jake|>{3}/.test(block.text)));
  }
});

test("the overview links all seven Tips invitations to their corresponding published readings", () => {
  const overview = records.find(record => record.route === "/experiencing-god");
  const tips = overview.blocks.filter(block => block.text.startsWith("Tips about"));
  assert.equal(tips.length, 7);
  for (const item of metadata.filter(item => item.order > 0)) {
    const tip = tips.find(block => block.text === item.tipsLabel);
    assert.deepEqual(tip.links, [{ label: item.tipsLabel, href: item.href }]);
    assert.ok(records.some(record => record.route === `/${item.slug}`));
    assert.equal(item.href.split("/").at(-1), item.slug.replace(/^experiencing-god-/, ""));
  }
});

test("uploaded Lord’s Prayer resources are linked while Because statements stay pending", () => {
  assert.deepEqual(metadata.filter(item => item.pendingLinks).map(item =>
    [item.prefix, item.pendingLinks.length]), [["2.1.002", 4], ["2.1.004", 3], ["2.1.005", 1], ["2.1.006", 4], ["2.1.008", 4]]);
  for (const item of metadata) {
    const record = records.find(record => record.route === `/${item.slug}`);
    for (const pending of item.pendingLinks ?? []) {
      assert.match(pending.sourceId, /^2\.(?:2|4\.30)\.\d{3}$/);
      const block = record.blocks.find(block => block.text === pending.label);
      assert.ok(block, `${item.prefix}: ${pending.label}`);
      const target = lordsMetadata.find(item => item.prefix.trim() === pending.sourceId);
      if (target) assert.deepEqual(block.links, [{ label: pending.label, href: target.href }]);
      else assert.ok(!block.links?.length, "Because statements await their own upload");
    }
  }
});

test("Journey and Desert include the same four resources as Quiet Time without altering their source text", () => {
  const quietTime = metadata.find(item => item.prefix === "2.1.002");
  for (const prefix of ["2.1.006", "2.1.008"]) {
    const item = metadata.find(item => item.prefix === prefix);
    assert.deepEqual(item.pendingLinks, quietTime.pendingLinks);
    const record = records.find(record => record.route === `/${item.slug}`);
    assert.deepEqual(record.blocks.slice(-5), [
      { kind: "heading", text: item.appendedResourcesHeading },
      ...quietTime.pendingLinks.map(link => {
        const target = lordsMetadata.find(item => item.prefix.trim() === link.sourceId);
        return { kind: "paragraph", text: link.label,
          ...(target ? { links: [{ label: link.label, href: target.href }] } : {}) };
      }),
    ]);
  }
});

test("source resource links are retained, same-site links stay local, and existing book destinations resolve", () => {
  const links = records.flatMap(record => record.blocks.flatMap(block => block.links ?? []));
  const sourceLinks = metadata.flatMap(item =>
    Object.entries(expected).find(([key]) => key.startsWith(item.prefix))[1].links
      .map(link => ({ ...link, href: link.href.replace(/^https:\/\/follow\.jesusonline\.com(?=\/)/i, "") })));
  const activatedLinks = metadata.flatMap(item => (item.pendingLinks ?? []).flatMap(resource => {
    const target = lordsMetadata.find(item => item.prefix.trim() === resource.sourceId);
    return target ? [{ label: resource.label, href: target.href }] : [];
  }));
  const ordered = links => [...links].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
  assert.deepEqual(ordered(records.filter(record => record.route !== "/experiencing-god")
    .flatMap(record => record.blocks.flatMap(block => block.links ?? []))), ordered([...sourceLinks, ...activatedLinks]));
  assert.ok(links.some(link => link.href.startsWith("https://app.jesusonline.com/")));
  assert.ok(links.some(link => link.href === "/promises"));
  assert.ok(links.some(link => link.href === "/knowing-god"));
  assert.ok(links.some(link => link.href === "/prayer"));
  for (const link of links) {
    assert.ok(!link.href.startsWith("https://follow.jesusonline.com/"));
    if (!link.href.startsWith("/gf/")) continue;
    const [, , bookSlug, readingSlug] = link.href.split("/");
    const book = getGFBook(bookSlug);
    assert.ok(book, link.href);
    assert.ok(book.readings.some(reading => reading.slug === readingSlug) ||
      book.introChapter?.slug === readingSlug, link.href);
  }
  const quiet = records.find(record => record.route === "/experiencing-god-quiet-time");
  assert.ok(quiet.blocks.some(block => block.text === "Environmental distractions" && block.headingLevel === 3));
});
