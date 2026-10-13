import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const src = fileURLToPath(new URL("../src/", import.meta.url));
const read = path => readFileSync(join(src, path), "utf8");

test("shared triple chevrons use a moderate size and close spacing", () => {
  const component = read("components/navigation-chevrons.tsx");
  assert.match(component, /viewBox="0 0 32 20"/);
  assert.equal([...component.matchAll(/<path d="m(?:3|12|21) 4 6 6-6 6"/g)].length, 3);
  assert.match(component, /translate\(32 0\) scale\(-1 1\)/);
  assert.match(component, /aria-hidden="true"/);
});

test("left navigation keeps the icon before the first word", () => {
  const component = read("components/navigation-chevrons.tsx");
  assert.match(component, /direction === "left"[\s\S]*<NavigationChevrons direction="left"[\s\S]*renderText\(label\.slice\(0, firstWordEnd\)\)/);
});

test("article sharing is an icon-only utility beside smaller breadcrumbs", () => {
  const share = read("components/share-button.tsx");
  assert.match(share, /export function ArticleShareButton[\s\S]*iconOnly variant="ghost"/);
  assert.match(share, /iconOnly \? <span className="sr-only">\{label\}<\/span>/);
  for (const path of ["pages/article-placeholder.tsx", "components/book-chapter-frame.tsx", "pages/gf/book.tsx"]) {
    const source = read(path);
    assert.match(source, /data-testid="article-utilities"[\s\S]*<ArticleShareButton/);
    assert.doesNotMatch(source, /<ShareButton/);
  }
});

test("the final label word and its chevrons remain in a single non-wrapping span", () => {
  const component = read("components/navigation-chevrons.tsx");
  assert.match(component, /className="whitespace-nowrap">\s*\{renderText\(label\.slice\(lastWordStart\)\)\}\s*<NavigationChevrons/);
  assert.match(component, /renderText\(label\.slice\(0, lastWordStart\)\)/);
});

test("navigation controls no longer import the old arrow icons", () => {
  for (const path of readdirSync(src, { recursive: true }).filter(path => path.endsWith(".tsx"))) {
    const source = read(path);
    assert.doesNotMatch(source, /import\s*\{[^}]*\b(?:ArrowLeft|ArrowRight|ChevronsRight)\b[^}]*\}\s*from\s*["']lucide-react/, path);
  }
});

test("Prayer's category badge and ordinal counter are omitted, without changing other article headers", () => {
  const article = read("pages/article-placeholder.tsx");
  assert.match(article, /article\.group !== "linked" && !isPrayerGuide/);
  assert.match(article, /\{!isPrayerGuide && <div className="mb-5 inline-flex/);
  assert.match(article, /Back to Connect with God/);
});
