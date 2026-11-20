import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  getXPIntroduction,
  KNOW_JESUS,
  XP_INTRODUCTIONS,
  XP_TOP_TEN,
  XP_TOP_TEN_CLOSING,
  xpIntroductionHref,
} from "../src/data/xp-next-steps";
import { getGFBook } from "../src/data/go-further-library";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const compact = (text: string) => text.replace(/\s/g, "");

// Read Word text without loading its embedded images or requiring a DOCX package.
function docxText(name: string) {
  const path = fileURLToPath(new URL(`../../../attached_assets/${name}`, import.meta.url));
  return execFileSync("python3", ["-c", `
import sys
from zipfile import ZipFile
from xml.etree import ElementTree as E
with ZipFile(sys.argv[1]) as z:
    root = E.fromstring(z.read("word/document.xml"))
ns = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
print("\\n".join("".join(t.text or "" for t in p.iter(ns+"t")) for p in root.iter(ns+"p")))
`, path], { encoding: "utf8" });
}

function removeAnnotations(text: string) {
  return text
    .replace(/URL:\s*https:\/\/follow\.jesusonline\.com\/[^\s<>]+/g, "")
    .replace(/Link to:\s*https:\/\/follow\.jesusonline\.com\/[^\s<>]+/g, "")
    .replace(/>>>/g, "");
}

const sourceFiles = {
  received: "Something-Real-Has-Begun-Introductory-Page_1795208476926.docx",
  rededicated: "Welcome-Back-Introductory-Page_1795208540915.docx",
  believer: "You-Already-Belong-Introductory-Page_1795208475754.docx",
} as const;

for (const type of ["received", "rededicated", "believer"] as const) {
  test(`${type} introduction preserves every word and all ten destinations from Word`, () => {
    const intro = XP_INTRODUCTIONS[type];
    const original = docxText(sourceFiles[type]);
    const rendered = [
      intro.title, ...intro.paragraphs, "Questions You May Be Asking",
      ...XP_TOP_TEN.map((q) => q.title), XP_TOP_TEN_CLOSING,
    ].join("\n");
    assert.equal(compact(rendered), compact(removeAnnotations(original)));
    const urls = [...original.matchAll(/Link to:\s*https:\/\/follow\.jesusonline\.com(\/[^\s<>]+)/g)]
      .map((match) => match[1]);
    assert.deepEqual(XP_TOP_TEN.map((q) => q.href), urls);
    assert.equal(xpIntroductionHref(type), `/xp/${type}/top10`);
  });
}

test("Know Jesus preserves all five sections, seven resources, and closing words", () => {
  const original = docxText("Know_Jesus_1795208486302.docx");
  const rendered = [
    KNOW_JESUS.title, KNOW_JESUS.introduction, KNOW_JESUS.lead,
    ...KNOW_JESUS.sections.flatMap((s) => [s.title, s.text, ...s.links.map((link) => link.title)]),
    ...KNOW_JESUS.closing,
  ].join("\n");
  assert.equal(compact(rendered), compact(removeAnnotations(original)));
  assert.equal(KNOW_JESUS.sections.length, 5);
  const links = KNOW_JESUS.sections.flatMap((s) => [...s.links]);
  assert.equal(links.length, 7);
  assert.deepEqual(links.map((link) => link.href),
    [...original.matchAll(/Link to:\s*https:\/\/follow\.jesusonline\.com(\/[^\s<>]+)/g)]
      .map((match) => match[1]));
});

test("all destinations are valid local resources", () => {
  const articles = JSON.parse(read("../src/data/article-library.json")).articles as {
    slug: string; retired?: boolean;
  }[];
  for (const question of XP_TOP_TEN.slice(0, 9)) {
    const slug = question.href.slice(1).replace("/", "-");
    assert.ok(articles.some((article) => article.slug === slug && !article.retired), question.href);
  }
  for (const { href } of KNOW_JESUS.sections.flatMap((section) => [...section.links])) {
    assert.ok(href.startsWith("/") && !href.startsWith("//"), href);
    if (href.startsWith("/gf/")) {
      const [, , bookSlug, readingSlug] = href.split("/");
      const book = getGFBook(bookSlug);
      assert.ok(book?.readings.some((reading) => reading.slug === readingSlug), href);
    }
  }
  const catalog = read("../public/bible-resources/catalog.json");
  assert.ok(catalog.includes('"discover-jesus"'));
  assert.ok(catalog.includes('"hearing-god"'));
  const experiences = JSON.parse(read("../src/data/experiencing-god-articles.json")) as { href: string }[];
  assert.ok(experiences.some((article) => article.href === "/experiencing-god"));
  assert.equal(XP_TOP_TEN[9].href, "/xp/know-Jesus");
});

test("only the three requested XP types have an introduction", () => {
  for (const type of ["did-not-pray", "unknown", "constructor", "__proto__"]) {
    assert.equal(getXPIntroduction(type), undefined);
    assert.equal(xpIntroductionHref(type), undefined);
  }
  const xpPage = read("../src/pages/xp-page.tsx");
  assert.ok(xpPage.includes('href={xpIntroductionHref(type)!} data-testid="xp-guide-link"'));
  assert.ok(xpPage.includes('href="/videos/Gods-Vision"'));
});

test("specific new routes precede the generic XP route and have distinct metadata", () => {
  const app = read("../src/App.tsx");
  const generic = app.indexOf('<Route path="/xp/:type"');
  for (const route of ["/xp/:type/top10", "/xp/know-Jesus", "/xp/know-jesus"]) {
    const index = app.indexOf(`<Route path="${route}"`);
    assert.ok(index >= 0 && index < generic, route);
  }
  assert.ok(app.includes("KNOW_JESUS.title"));
  assert.ok(app.includes("introduction?.title"));
});
