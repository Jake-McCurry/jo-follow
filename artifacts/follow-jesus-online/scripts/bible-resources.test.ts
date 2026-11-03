import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildLinkMap, canonicalBookFromTitle, normalizeSourceUrl, numericChapters,
  parseRef, preprocessSurveyMarkdown, readerHref, splitRefs,
} from "../src/lib/bible-resources";

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const catalog = JSON.parse(read("public/bible-resources/catalog.json"));
const items = catalog.collections.flatMap((c: any) => c.items.map((i: any) => ({ ...i, collectionId: c.id })));
const articles = [...new Set<string>(items.filter((i: any) => i.sourceUrl).map((i: any) => i.id))]
  .map(id => JSON.parse(read(`public/bible-resources/articles/${id}.json`)));
const sha = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
const cleanBody = (raw: string) => {
  const title = raw.match(/^# (.+)$/m)![1];
  return raw.slice(raw.indexOf("\n", raw.indexOf("# " + title)) + 1).trim()
    .replace(/^\[Download PDF\]\([^\n]+\)\s*/, "")
    .replace(/\n\[(?:Next Article|Previous Article|Up Next)[\s\S]*$/, "")
    .replace(/\n\[Find this article on the JO App\][\s\S]*$/, "").trim();
};

test("inventory covers every requested collection, preserving original source order", () => {
  assert.deepEqual(catalog.collections.map((c: any) => [c.id, c.items.length]), [
    ["study-methods", 4], ["discover-jesus", 30], ["hearing-god", 124],
    ["survey-ot", 38], ["survey-nt", 27], ["promises-collection", 8],
  ]);
  assert.equal(items.filter((i: any) => i.status === "imported").length, 226);
  assert.equal(new Set(items.map((i: any) => i.id)).size, 230);
  assert.equal(articles.filter((a: any) => a.importStatus === "imported").length, 225);
  assert.ok(catalog.collections[0].items.some((i: any) => i.title === "S.O.A.P. Method"));
  for (const item of items.filter((i: any) => i.status === "imported")) {
    const article = articles.find((a: any) => a.id === item.id);
    assert.equal(article.path, item.path);
    assert.ok(article.markdown.length > 700, item.id);
  }
});

test("all 227 unique captured articles match their source snapshots, with no rewritten teaching copy", () => {
  assert.equal(articles.length, 227);
  for (const article of articles) {
    assert.equal(article.sourceSha256, sha(article.sourceMarkdown), article.id);
    assert.equal(article.contentSha256, sha(article.markdown), article.id);
    assert.equal(article.markdown, cleanBody(article.sourceMarkdown), article.id);
    assert.equal(article.title, article.sourceMarkdown.match(/^# (.+)$/m)[1]);
    assert.doesNotMatch(article.markdown, /\[Find this article on the JO App\]/);
    if (article.collectionId.startsWith("survey")) {
      assert.match(article.markdown, /JoshuaNations\.org/);
      const prepared = preprocessSurveyMarkdown(article.markdown).replace(/^## /gm, "");
      assert.equal(prepared.replace(/\s+/g, " ").trim(), article.markdown.replace(/\s+/g, " ").trim(), article.id);
    }
  }
});

test("source gaps and inconsistent lessons are not passed off as completed or duplicated lessons", () => {
  const upcoming = items.filter((i: any) => i.status === "coming-soon");
  assert.deepEqual(upcoming.map((i: any) => i.title), ["Ezra and Nehemiah", "Song of Songs", "Jeremiah", "Philippians"]);
  for (const item of upcoming) assert.equal(item.path, null);
  const first = items.find((i: any) => i.title === "1 Thessalonians");
  assert.equal(first.status, "blocked");
  assert.equal(first.path, null);
  assert.match(first.issue, /2 Thessalonians/);
  assert.ok(catalog.issues.some((i: any) => i.sourceUrl.endsWith("/philippians")));
});

test("all original PDFs are local, complete and byte-verified; no production scraping is needed", () => {
  for (const article of articles) {
    assert.equal(article.pdf.status, "available", article.id);
    const bytes = readFileSync(new URL(`../public${article.pdf.path}`, import.meta.url));
    assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
    assert.match(bytes.subarray(-100).toString(), /%%EOF/);
    assert.equal(sha(bytes), article.pdf.sha256);
    assert.ok(bytes.length < 311_000);
  }
  assert.equal(catalog.supplementalPdfs.length, 1);
  for (const pdf of catalog.supplementalPdfs) {
    assert.equal(sha(readFileSync(new URL(`../public${pdf.path}`, import.meta.url))), pdf.sha256);
  }
  const ui = read("src/pages/bible-resources.tsx");
  assert.doesNotMatch(ui, /iframe|fetch\(["'`]https:\/\/equip/);
});

test("source resource links resolve locally while attribution stays attributed", () => {
  const map = buildLinkMap(catalog);
  for (const article of articles.filter((a: any) => a.importStatus === "imported")) {
    for (const match of article.markdown.matchAll(/\]\((https?[^)]+)\)/g)) {
      const url = match[1];
      if (url === "https://joshuanations.org/") continue;
      assert.ok(map.get(normalizeSourceUrl(url))?.startsWith("/"), `${article.id}: ${url}`);
    }
  }
  const route = read("src/App.tsx");
  assert.ok(route.indexOf('path="/bible/resources"') < route.indexOf('path="/bible/:book/:chapter"'));
  for (const page of ["bible-reader", "bible-landing"]) {
    assert.match(read(`src/pages/${page}.tsx`), /See Bible Resources/);
  }
});

test("Scripture references use the correct book and reject ambiguous or malformed citations", () => {
  assert.equal(canonicalBookFromTitle("Exodus", "survey-ot"), "Exodus");
  assert.equal(canonicalBookFromTitle("Genesis", "study-methods"), null);
  assert.equal(canonicalBookFromTitle("1 & 2 Chronicles", "survey-ot"), null);
  assert.equal(parseRef("Genesis", "15:1-31"), null);
  assert.equal(parseRef("Genesis", "25:7:7-10"), null);
  assert.equal(parseRef("Exodus", "999:1"), null);
  assert.equal(parseRef("Not a book", "1:1"), null);
  assert.equal(splitRefs("(3:1-5)", null).filter(p => p.ref).length, 0);
  assert.equal(splitRefs("(3:1-5)", "Exodus").find(p => p.ref)?.ref?.book, "Exodus");
  assert.equal(splitRefs("Genesis 25:7:7-10", null).filter(p => p.ref).length, 0);
  const refs = splitRefs("John 3:16; 4:1-3 and (2:1-4)", "Exodus").filter(p => p.ref);
  assert.deepEqual(refs.map(p => p.ref?.book), ["John", "John", "Exodus"]);
  const range = parseRef("Genesis", "6:5-8:19")!;
  assert.equal(range.endChapter, 8);
  assert.match(readerHref(range), /^\/bible\/Genesis\/6#verses-5$/);
});

test("survey display headings preserve wording while improving chapter ranges and discussion layout", () => {
  assert.equal(numericChapters("Chapters one through five. Creation to Noah"), "Chapters 1-5. Creation to Noah");
  const genesis = articles.find((a: any) => a.id === "survey-ot--genesis");
  const prepared = preprocessSurveyMarkdown(genesis.markdown);
  assert.match(prepared, /## B\. Chapters 6 through 11/);
  assert.match(prepared, /## III\. Discussion Questions and Application\./);
  assert.match(read("src/index.css"), /\.resource-discussion strong\s*\{\s*font-weight:inherit/);
  const preview = read("src/components/bible-resources/scripture-preview.tsx");
  assert.match(preview, /version: "NET"/);
  assert.match(preview, /Close preview/);
  assert.match(preview, /onEscapeKeyDown/);
  assert.match(preview, /onMouseEnter/);
  assert.match(preview, /min-width: 768px/);
  assert.match(read("src/index.css"), /@media \(min-width:768px\) and \(hover:hover\) and \(pointer:fine\)/);
  assert.match(preview, /max-h-/);
  assert.doesNotMatch(preview, /verses\.length \? verses : data\.verses/);
});
