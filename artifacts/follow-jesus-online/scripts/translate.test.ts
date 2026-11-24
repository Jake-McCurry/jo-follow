import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BrowserDrawing, type BrowserDrawingVariant } from "../src/components/translate/browser-drawing";

const source = (file: string) => readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");

test("translation navigation is local, accessible and uses the existing base-aware router", () => {
  const layout = source("components/layout.tsx");
  assert.equal((layout.match(/href="\/translate"/g) ?? []).length, 2);
  assert.ok(layout.includes('aria-label="Translate this page — instructions"'));
  assert.ok(layout.includes('title="Translate this page"'));
  assert.ok(layout.includes("<Languages"));
  const app = source("App.tsx");
  assert.ok(app.includes('<Route path="/translate" component={TranslatePage} />'));
  assert.ok(app.includes("Translate · Follow Jesus Online"));
  assert.ok(app.includes("Read Follow Jesus Online in your heart language. Step-by-step instructions"));
});

test("all five drawings render labelled SVGs with the matching step markers", () => {
  const expected: [BrowserDrawingVariant, number[]][] = [
    ["chrome-menu", [1, 2]], ["chrome-address", [3]],
    ["android", [1, 2]], ["safari", [1, 2]], ["google-translate", [1, 2, 3]],
  ];
  for (const [variant, markers] of expected) {
    const svg = renderToStaticMarkup(createElement(BrowserDrawing, { variant }));
    assert.match(svg, /role="img"/);
    assert.match(svg, /aria-label="Drawing of /);
    assert.ok(!svg.includes("var("));
    assert.ok(!svg.includes("<image"));
    for (const n of markers) {
      assert.match(svg, new RegExp(`fill="#FFFFFF">${n}</text>`), variant);
    }
    assert.match(svg, /fill="#DCF0FF" stroke="#0095FF"/);
  }
});

test("instructions preserve the requested methods and use safe, explicitly chosen external links", () => {
  const page = source("pages/translate.tsx");
  for (const text of ["Multilingual Access", "Translate this Page", "Recommended",
    "Most of our visitors use Chrome.", "Google Chrome (desktop)", "Chrome on Android",
    "Safari on iPhone or iPad", "Any browser", "Heads up:", "provided by Apple, not Google",
    'const SITE_URL = "https://follow.jesusonline.com"']) {
    assert.ok(page.includes(text), text);
  }
  assert.ok(page.includes('href="https://translate.google.com/?sl=en&tl=es&op=websites" target="_blank" rel="noopener noreferrer"'));
  assert.ok(page.includes('href="https://jesusonline.com" target="_blank" rel="noopener noreferrer"'));
  assert.ok(!/<(?:iframe|script)\b/i.test(page));
  assert.ok(page.includes("grid-cols-1 gap-4 sm:grid-cols-2"));
  assert.ok(page.includes("max-w-[448px] grid-cols-2"));
});
