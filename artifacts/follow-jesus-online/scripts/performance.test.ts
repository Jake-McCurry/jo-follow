import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { runInNewContext } from "node:vm";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import worker from "../src/worker";
import { getArticlePath, getArticleSlugFromPath } from "../src/data/article-routing";
import { lazyPage } from "../src/lib/lazy-page";

const read = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const env = { ASSETS: { fetch: async () => new Response("asset") } };

test("lazy pages do not pull the full article library into the entry point", () => {
  const app = read("src/App.tsx");
  assert.match(app, /const KnowingGodPage = lazy\(/);
  assert.match(app, /const PromisesPage = lazy\(/);
  assert.match(app, /const BibleReaderPage = lazy\(/);
  assert.match(app, /import\('@\/data\/article-library'\)/);
  assert.doesNotMatch(app, /^import .*from ['"]@\/data\/article-library['"]/m);
  assert.match(app, /<Layout trackHistory=\{false\}>/);
  assert.match(read("src/components/layout.tsx"), /if \(!trackHistory\) return/);
  assert.match(read("src/main.tsx"), /preloadInitialPage\(window.location.pathname\)/);
});

test("the requested initial section renders without a second Suspense placeholder", async () => {
  let calls = 0;
  const Page = lazyPage(async () => {
    calls++;
    return { default: ({ title }: { title: string }) => createElement("h1", null, title) };
  });
  await Promise.all([Page.preload(), Page.preload()]);
  assert.equal(calls, 1);
  assert.equal(renderToStaticMarkup(createElement(Page, { title: "Real reading content" })), "<h1>Real reading content</h1>");
});

test("article navigation preserves canonical and legacy destinations", () => {
  for (const file of ["because-statements.json", "lords-prayer-articles.json", "experiencing-god-articles.json", "prayer-articles.json"]) {
    const articles = JSON.parse(read(`src/data/${file}`)) as { slug: string; href: string }[];
    for (const article of articles) {
      assert.equal(getArticlePath(article.slug), article.href);
      assert.equal(getArticleSlugFromPath(article.href), article.slug);
    }
  }
  assert.equal(getArticlePath("adv-begin-the-adventure"), "/adv/begin-the-adventure");
  assert.equal(getArticleSlugFromPath("/more-believer-more-options"), "more-believer-more-options");
});

test("public Bible responses cache by URL without caching validation failures or upstream errors", async t => {
  const books = await worker.fetch(new Request("https://example.com/api/bible/books"), env);
  assert.equal(books.headers.get("cache-control"), "public, max-age=86400");
  t.mock.method(globalThis, "fetch", async (input: URL | string | Request) => {
    const url = String(input);
    return url.includes("translation=kjv")
      ? Response.json({ verses: [{ book_name: "John", chapter: 13, verse: 10, text: "KJV test wording" }] })
      : Response.json([{ bookname: "John", chapter: 13, verse: 10, text: "NET test wording" }]);
  });
  for (const version of ["NET", "KJV"]) {
    const result = await worker.fetch(new Request(`https://example.com/api/bible/passage?passage=John%2013:10&version=${version}`), env);
    assert.equal(result.status, 200);
    assert.equal(result.headers.get("cache-control"), "public, max-age=300, s-maxage=3600");
    const body = await result.json();
    assert.equal(body.version, version);
    assert.equal(body.verses[0].text, `${version} test wording`);
  }
  const invalid = await worker.fetch(new Request("https://example.com/api/bible/passage?passage=John%203&version=BAD"), env);
  assert.equal(invalid.status, 400);
  assert.equal(invalid.headers.get("cache-control"), "no-store");
  t.mock.method(globalThis, "fetch", async () => new Response("unavailable", { status: 503 }));
  const failed = await worker.fetch(new Request("https://example.com/api/bible/passage?passage=John%2012:9"), env);
  assert.equal(failed.status, 502);
  assert.equal(failed.headers.get("cache-control"), "no-store");
});

test("production entry stays below its compressed size budget", () => {
  const html = read("dist/public/index.html");
  const entry = html.match(/<script type="module"[^>]+src="([^"]+)"/)?.[1];
  assert.ok(entry);
  const code = read(`dist/public${entry}`);
  assert.ok(gzipSync(code).length < 200_000, "Initial app code must stay below 200 KB gzip.");
  const assets = readdirSync(new URL("../dist/public/assets", import.meta.url));
  assert.ok(assets.some(name => name.startsWith("article-library-")), "Article content has a separate on-demand chunk.");
  assert.ok(assets.some(name => name.startsWith("bible-reader-")), "Bible reader has a separate on-demand chunk.");
});

test("production preloads only the current route and keeps fonts local", () => {
  const html = read("dist/public/index.html");
  const script = html.match(/<script data-route-preloads>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script);
  const requestsFor = (pathname: string) => {
    const requests: string[] = [];
    runInNewContext(script, {
      location: { pathname },
      document: {
        createElement: () => ({}),
        head: { appendChild: (link: { href: string }) => requests.push(link.href) },
      },
    });
    return requests;
  };
  assert.equal(requestsFor("/").length, 0, "Homepage must not fetch every section.");
  assert.ok(requestsFor("/xp/received").some(url => /xp-page-/.test(url)));
  assert.ok(requestsFor("/bible/John/3").some(url => /bible-reader-/.test(url)));
  assert.ok(requestsFor("/prayer/what-is-prayer").some(url => /article-placeholder-/.test(url)));
  assert.ok(!requestsFor("/knowing-god").some(url => /article-library-|bible-reader-/.test(url)));
  assert.ok(html.indexOf('charset="UTF-8"') < 1024, "Encoding declaration stays near the document start.");
  assert.ok(!html.includes("fonts.googleapis.com"));
  const fonts = read("public/fonts/follow-fonts.css");
  assert.ok(fonts.includes("unicode-range:"));
  assert.ok(fonts.includes("'Playfair Display'") && fonts.includes("'Source Sans 3'"));
  for (const url of fonts.matchAll(/url\(([^)]+)\)/g)) {
    assert.ok(url[1].startsWith("./"));
    assert.ok(statSync(new URL(`../public/fonts/${url[1].slice(2)}`, import.meta.url)).size > 0);
  }
});


test("responsive images are smaller and illustration conversions preserve every visible pixel", async () => {
  const dir = new URL("../dist/public/optimized-images/", import.meta.url);
  for (const name of readdirSync(dir)) {
    const original = name.startsWith("hero-") ? "walking-with-jesus-hero-ankle-crop.jpg" : "guide-cover.png";
    assert.ok(statSync(new URL(name, dir)).size < statSync(new URL(`../public/${original}`, import.meta.url)).size);
  }
  const articleDir = new URL("../dist/public/article-images/", import.meta.url);
  for (const name of readdirSync(articleDir).filter(name => name.endsWith(".png.webp"))) {
    const original = new URL(name.slice(0, -5), articleDir);
    const optimized = new URL(name, articleDir);
    assert.ok(statSync(optimized).size < statSync(original).size, name);
    const before = await sharp(readFileSync(original)).ensureAlpha().raw().toBuffer();
    const after = await sharp(readFileSync(optimized)).ensureAlpha().raw().toBuffer();
    // Lossless WebP can discard invisible RGB values under fully transparent pixels.
    for (let i = 0; i < before.length; i += 4) {
      if (before[i + 3] === 0) before.fill(0, i, i + 3);
      if (after[i + 3] === 0) after.fill(0, i, i + 3);
    }
    assert.ok(before.equals(after), `${name}: exact visible-pixel match`);
  }
  assert.ok(!readdirSync(articleDir).some(name => /\.jpe?g\.webp$/i.test(name)), "Do not inflate already-compressed JPEG illustrations.");
});
