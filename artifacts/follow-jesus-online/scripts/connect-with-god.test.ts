import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, statSync } from "node:fs";
import { CONNECT_WITH_GOD_RESOURCES, TOPIC_MENU_LINKS } from "../src/data/connect-with-god";
import { getGFBook } from "../src/data/go-further-library";

// The application library also loads Vite virtual modules. Validate these
// destinations against its published JSON sources without invoking Vite in Node.
type PublishedArticle = { slug: string; retired?: boolean; blocks?: unknown[]; file?: string };
const articles: PublishedArticle[] = [
  ...JSON.parse(readFileSync(new URL("../src/data/article-library.json", import.meta.url), "utf8")).articles,
  ...JSON.parse(readFileSync(new URL("../src/data/imported-deeper-articles.json", import.meta.url), "utf8")),
];

test("the topic menu includes every requested topic in document order", () => {
  assert.deepEqual(TOPIC_MENU_LINKS.map((item) => item.label), [
    "Bible", "Prayer", "Books", "Holy Spirit", "Videos", "Promises", "Knowing God",
  ]);
});

test("Connect with God preserves all nine resource titles and descriptions", () => {
  assert.deepEqual(CONNECT_WITH_GOD_RESOURCES.map(({ title, description }) => ({ title, description })), [
    { title: "Read the Bible", description: "Open the Word. Meet the Father." },
    { title: "Knowing God / Topical Concordance", description: "A new view of the Father, one topic at a time." },
    { title: "God’s Promises for Hope", description: "When feelings fail, His promises still stand." },
    { title: "Reflecting on God’s Majesty", description: "Because of who God is, I worship." },
    { title: "Reflecting on Your identity in Christ", description: "Because of who I am in Christ, I belong." },
    { title: "Reflecting on the Work of the Spirit", description: "Because of what the Spirit does, I walk." },
    { title: "Experiencing God 24/7", description: "Practice His presence from first light to last thought." },
    { title: "Prayer Starters", description: "Begin the conversation." },
    { title: "The Lord’s Prayer Guide", description: "Pray as Jesus taught—one topic at a time." },
  ]);
});

test("every menu and resource destination resolves to existing content", () => {
  const links = [...TOPIC_MENU_LINKS, ...CONNECT_WITH_GOD_RESOURCES];
  for (const { href } of links) {
    if (href === "/rewatch" || href === "/gf/") continue;
    if (href.startsWith("/bible/")) {
      assert.ok(["/bible/John/1", "/bible/Romans/8"].includes(href), href);
      continue;
    }
    if (href.startsWith("/gf/")) {
      const [, , bookSlug, readingSlug] = href.split("/");
      const book = getGFBook(bookSlug);
      assert.ok(book, `Missing book: ${href}`);
      if (readingSlug) {
        assert.ok(book.readings.some((reading) => reading.slug === readingSlug), `Missing reading: ${href}`);
      }
      continue;
    }
    const match = href.match(/^\/(adv|deeper)\/([a-z0-9-]+)$/);
    assert.ok(match, `Unrecognized route: ${href}`);
    const slug = `${match[1]}-${match[2]}`;
    const article = articles.find((item) => item.slug === slug);
    assert.ok(article && !article.retired, `Missing or retired article: ${href}`);
    if (article.blocks) {
      assert.ok(article.blocks.length > 0, `Empty article: ${href}`);
    } else {
      // Imported articles are built from their DOCX sources by Vite, which
      // also checks their readable body text during the production build.
      assert.ok(article.file, `Missing article source: ${href}`);
      assert.ok(statSync(new URL(`../../../attached_assets/${article.file}`, import.meta.url)).size > 0,
        `Empty article source: ${href}`);
    }
  }
});

test("exact prayer guide and approved fallback resources remain linked", () => {
  assert.equal(CONNECT_WITH_GOD_RESOURCES.find((item) => item.title === "The Lord’s Prayer Guide")?.href,
    "/deeper/the-lords-prayer-guide");
  assert.equal(CONNECT_WITH_GOD_RESOURCES.find((item) => item.title === "God’s Promises for Hope")?.href,
    "/bible/Romans/8");
  assert.equal(CONNECT_WITH_GOD_RESOURCES.find((item) => item.title === "Knowing God / Topical Concordance")?.href,
    "/gf/beholding-the-majesty-of-god");
});