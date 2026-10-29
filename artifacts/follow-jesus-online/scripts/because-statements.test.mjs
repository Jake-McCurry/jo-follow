import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { loadConfigFromFile } from "vite";
import { getGFBook } from "../src/data/go-further-library.ts";
import { CONNECT_WITH_GOD_RESOURCES } from "../src/data/connect-with-god.ts";

const root = path.resolve(import.meta.dirname, "..");
const metadata = JSON.parse(readFileSync(path.join(root, "src/data/because-statements.json"), "utf8"));
const expected = JSON.parse(execFileSync("python3", [
  path.join(root, "scripts/prayer-source-extract.py"),
  path.resolve(root, "../../attached_assets/OneDrive_2026-10-29_(1)_1793306993730.zip"),
], { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 }));
const config = await loadConfigFromFile({ command: "build", mode: "production" }, path.join(root, "vite.config.ts"));
const plugin = config.config.plugins.flat().find(item => item?.name === "jolf-article-content");
const generated = await plugin.load("\0virtual:article-content");
const records = JSON.parse(generated.replace(/^export default /, "").replace(/;$/, ""))
  .filter(record => record.category === "Because statements");

test("all three v.102926 documents retain their complete source wording and headings", () => {
  assert.equal(records.length, 3);
  for (const item of metadata) {
    const source = Object.entries(expected).find(([name]) => path.basename(name).startsWith(item.prefix))?.[1];
    assert.ok(source, item.prefix);
    const record = records.find(record => record.route === `/${item.slug}`);
    assert.ok(record, item.slug);
    assert.deepEqual(record.blocks.map(block => block.text), source.paragraphs);
    assert.equal(record.title, source.paragraphs[0]);
    assert.ok(record.blocks.filter(block => block.text.startsWith("Because ")).length >= 20);
  }
});

test("each eBook contents section retains all supplied copy and links to existing chapters", () => {
  for (const item of metadata) {
    const record = records.find(record => record.route === `/${item.slug}`);
    const book = getGFBook(item.bookSlug);
    assert.ok(book?.ebookHref);
    const footer = record.blocks.slice(record.blocks.findIndex(block => block.text === "GO DEEPER"));
    assert.equal(footer[1].text, book.title);
    assert.equal(footer[3].text, "Download eBook");
    const contents = footer.findIndex(block => block.text === "Contents");
    const normalize = text => text.replace(/^\d+\.\s*/, "").replace(/[–—]/g, "-").toLowerCase();
    for (const [index, reading] of book.readings.entries()) {
      const offset = contents + 1 + index * 3;
      assert.equal(footer[offset].text, `Chapter ${index + 1}`);
      assert.equal(normalize(footer[offset + 1].text), normalize(reading.title));
      assert.ok(footer[offset + 2].text);
    }
    assert.equal(footer.length, contents + 1 + book.readings.length * 3 + 2);
    const card = CONNECT_WITH_GOD_RESOURCES.find(resource => resource.href === item.href);
    assert.equal(card?.title, item.cardTitle);
  }
});
