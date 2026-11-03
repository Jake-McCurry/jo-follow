import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { knowingGodIntroductions } from "../src/data/knowingGodIntroductions.ts";
import { kjvScriptureHref } from "../src/components/knowing-god/knowing-god-ui.ts";

const source = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const data = JSON.parse(source("src/data/knowing-god/introduction/appendices.json"));

test("appendices follow Notable Quotations in the existing previous/next navigation", () => {
  assert.equal(knowingGodIntroductions.length, 8);
  assert.deepEqual(knowingGodIntroductions.slice(4).map(a => a.slug),
    ["notable-quotations", "bible-memorization", "notes", "bibliography"]);
  assert.deepEqual(knowingGodIntroductions.slice(5).map(a => a.pdfPages), [[1131, 1133], [1129], [1129]]);
  const page = source("src/pages/knowing-god/introduction.tsx");
  assert.match(page, /previous=\{knowingGodIntroductions\[index - 1\]/);
  assert.match(page, /next=\{knowingGodIntroductions\[index \+ 1\]/);
  const article = source("src/components/knowing-god/IntroArticle.tsx");
  assert.match(article, /<IntroAppendices slug=\{article.slug\}/);
  assert.match(article, /introductory material and closing appendices/);
});

test("all appendix text retains its PDF-verified transcription", () => {
  // All strings were checked directly against physical PDF pages 1129,1131,1133
  // using .agents/scripts/inspect_knowing_god_appendices.py.
  assert.equal(createHash("sha256").update(JSON.stringify(data)).digest("hex"),
    "a9a9acd3e0262d80939331cab947afcf850e03373da740c2fee7b6cda0051fee");
  assert.equal(data.memorization.instructions.length, 7);
  assert.equal(data.memorization.back.passage.length, 4);
  assert.equal(data.memorization.front.comments.length, 4);
  assert.equal(data.memorization.closing.reference, "Psalm 119:11");
  assert.equal(data.salvationPassages.length, 21);
  assert.equal(data.notes.length, 6);
  assert.equal(data.bibliography.length, 7);
  assert.equal(data.resources.length, 5);
});

test("memory-card connections and appendices remain semantic HTML", () => {
  const ui = source("src/components/knowing-god/IntroAppendices.tsx");
  for (let n = 1; n <= 7; n++) assert.ok(ui.includes(`<Marker n={${n}}`));
  assert.match(ui, /href=\{`#memory-step-\$\{n\}`\}/);
  assert.match(ui, /id=\{`memory-step-\$\{i \+ 1\}`\}/);
  assert.match(ui, /href=\{`#memory-field-\$\{i \+ 1\}`\}/);
  assert.match(ui, /<ol className="memory-instructions"/);
  assert.match(ui, /<ol className="appendix-citations"/);
  assert.match(ui, /Recommended Resources for Further Study/);
  assert.doesNotMatch(ui, /<img|<iframe|<canvas|dangerouslySetInnerHTML/);
  const css = source("src/styles/knowing-god-intro.css");
  assert.match(css, /ol\.appendix-citations\{ list-style:decimal/);
  assert.match(css, /scroll-margin-top:calc\(var\(--kg-header-height/);
});

test("all 21 memorization references open their corresponding KJV passage", () => {
  for (const { reference } of data.salvationPassages) {
    const href = kjvScriptureHref(reference, "/follow/");
    assert.ok(href.startsWith("/follow/bible/"), reference);
    assert.ok(href.includes("?version=KJV#verse-"), reference);
  }
  assert.equal(kjvScriptureHref("Revelation 22:17, 20"), "/bible/Revelation/22?version=KJV#verse-17");
  const ui = source("src/components/knowing-god/IntroAppendices.tsx");
  assert.match(ui, /href=\{kjvScriptureHref\(p\.reference, import\.meta\.env\.BASE_URL\)\} target="_blank" rel="noopener noreferrer"/);
});
