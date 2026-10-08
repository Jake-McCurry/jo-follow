import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const projectRoot = path.resolve(import.meta.dirname, "..");
const articleLibraryPath = path.join(
  projectRoot,
  "src/data/article-library.json",
);
const importedDeeperPath = path.join(
  projectRoot,
  "src/data/imported-deeper-articles.json",
);
const linkedArticlesPath = path.join(projectRoot, "src/data/linked-articles.json");
const faqReadingLinksPath = path.join(projectRoot, "src/data/faq-reading-links.json");
const goFurtherLibraryPath = path.join(projectRoot, "src/data/go-further-library.ts");
const sourceRoot = path.join(projectRoot, "src");
const xpPagePath = path.join(projectRoot, "src/pages/xp-page.tsx");

const articleRoutePattern = /^(?:adv|deeper|more|prayer)-[a-z0-9-]+$/;
const sequenceGroups = [
  "adventure",
  "deeper",
  "received",
  "rededicated",
  "believer",
  "no-decision",
];
const allowedGroups = new Set([...sequenceGroups, "resources"]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function collectPublishedArticleSlugs(source, filePath) {
  const slugs = [];
  const publishedSlugPatterns = [
    /["'`]\/((?:adv|deeper|more|prayer)-[a-z0-9-]+)["'`]/g,
    /["'`]\/(adv|deeper|prayer)\/([a-z0-9-]+)["'`]/g,
    /["'`]\/(prayer)["'`]/g,
  ];

  if (filePath === xpPagePath) {
    publishedSlugPatterns.push(
      /:\s*["'`]((?:adv|deeper|more)-[a-z0-9-]+)["'`]/g,
    );
  }

  for (const pattern of publishedSlugPatterns) {
    for (const match of source.matchAll(pattern)) {
      const line = source.slice(0, match.index).split("\n").length;
      slugs.push({
        slug: match[2] ? `${match[1]}-${match[2]}` : match[1] === "prayer" ? "prayer-starter-guide" : match[1],
        location: `${path.relative(projectRoot, filePath)}:${line}`,
      });
    }
  }

  return slugs;
}

function listSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(entryPath);
    return /\.[cm]?[jt]sx?$/.test(entry.name) ? [entryPath] : [];
  });
}

function findMissingPublishedLinks(catalog, publishedLinks) {
  return publishedLinks
    .filter(({ slug }) => !catalog.has(slug))
    .map(
      ({ slug, location }) =>
        `${location} publishes missing article route "/${slug}"`,
    );
}

function articleSlugFromHref(href) {
  if (typeof href !== "string") return undefined;
  if (/^\/prayer(?:[?#].*)?$/.test(href)) return "prayer-starter-guide";
  const legacy = href.match(/^\/((?:adv|deeper|more|prayer)-[a-z0-9-]+)(?:[?#].*)?$/);
  if (legacy) return legacy[1];
  const canonical = href.match(/^\/(adv|deeper|prayer)\/([a-z0-9-]+)(?:[?#].*)?$/);
  return canonical ? `${canonical[1]}-${canonical[2]}` : undefined;
}

function validateArticleLibrary() {
  const library = readJson(articleLibraryPath);
  const importedDeeper = readJson(importedDeeperPath);
  const linkedArticles = readJson(linkedArticlesPath);
  const articles = library?.articles;
  const errors = [];

  if (!Array.isArray(articles) || articles.length === 0) {
    return ["article-library.json must contain a non-empty articles array"];
  }
  const publishedArticles = articles.filter((article) => !article?.retired);

  const slugs = new Set();
  const catalog = new Map();
  for (const article of readJson(path.join(projectRoot, "src/data/prayer-articles.json"))) {
    catalog.set(article.slug, article);
  }

  for (const article of importedDeeper) {
    catalog.set(article.slug, article);
  }
  for (const article of linkedArticles) {
    if (!articleRoutePattern.test(article.slug) || !isNonEmptyString(article.faqSlug)) {
      errors.push(`invalid linked-only article metadata for "${article.slug}"`);
    }
    if (!catalog.has(article.slug)) catalog.set(article.slug, article);
  }

  for (const article of publishedArticles) {
    if (
      !article ||
      typeof article !== "object" ||
      !isNonEmptyString(article.slug)
    )
      continue;
    if (slugs.has(article.slug)) {
      errors.push(`duplicate article URL "/${article.slug}"`);
    }
    slugs.add(article.slug);
    catalog.set(article.slug, article);
  }
  for (const article of linkedArticles) {
    if (!catalog.has(article.faqSlug)) errors.push(`${article.slug} links from missing FAQ "${article.faqSlug}"`);
  }

  for (const [articleIndex, article] of publishedArticles.entries()) {
    const label = `articles[${articleIndex}]`;

    if (!article || typeof article !== "object") {
      errors.push(`${label} must be an object`);
      continue;
    }

    if (!isNonEmptyString(article.slug)) {
      errors.push(`${label}.slug must be a non-empty string`);
    } else {
      if (!articleRoutePattern.test(article.slug)) {
        errors.push(
          `${label}.slug "${article.slug}" is not a published article route`,
        );
      }
    }

    if (!isNonEmptyString(article.title))
      errors.push(`${label}.title is empty`);
    if (!allowedGroups.has(article.group))
      errors.push(`${label}.group "${article.group}" is invalid`);
    if (!Number.isInteger(article.order) || article.order < 0) {
      errors.push(`${label}.order must be a non-negative integer`);
    }
    if (!isNonEmptyString(article.excerpt))
      errors.push(`${label}.excerpt is empty`);

    if (!Array.isArray(article.blocks) || article.blocks.length === 0) {
      errors.push(`${label}.blocks must contain at least one block`);
      continue;
    }

    for (const [blockIndex, block] of article.blocks.entries()) {
      const blockLabel = `${label}.blocks[${blockIndex}]`;
      if (!block || typeof block !== "object") {
        errors.push(`${blockLabel} must be an object`);
        continue;
      }
      if (
        ![
          "heading",
          "paragraph",
          "question",
          "list",
          "table-row",
          "link",
        ].includes(block.type)
      ) {
        errors.push(`${blockLabel}.type "${block.type}" is invalid`);
      }
      if (!isNonEmptyString(block.text))
        errors.push(`${blockLabel}.text is empty`);
      if (block.type === "link" && !isNonEmptyString(block.href)) {
        errors.push(`${blockLabel}.href is empty`);
      }

      for (const href of [block.href, ...(block.links?.map((link) => link.href) ?? [])]) {
        const linkedSlug = articleSlugFromHref(href);
        if (linkedSlug && !catalog.has(linkedSlug)) {
          errors.push(`${label} links to missing article route "${href}"`);
        }
      }
    }

    if (article.relatedSlug && !catalog.has(article.relatedSlug)) {
      errors.push(
        `${article.slug}.relatedSlug points to missing article "${article.relatedSlug}"`,
      );
    }

    if (article.continuation) {
      if (typeof article.continuation !== "object") {
        errors.push(`${article.slug}.continuation must be an object`);
      } else {
        if (!isNonEmptyString(article.continuation.label)) {
          errors.push(`${article.slug}.continuation.label is empty`);
        }
        if (!isNonEmptyString(article.continuation.href)) {
          errors.push(`${article.slug}.continuation.href is empty`);
        }
        const canonicalArticleLink = article.continuation.href?.match(
          /^\/((?:adv|deeper)\/[a-z0-9-]+)(?:[?#].*)?$/,
        );
        if (canonicalArticleLink) {
          const [, route] = canonicalArticleLink;
          const [group, routeSlug] = route.split("/");
          if (!catalog.has(`${group}-${routeSlug}`)) {
            errors.push(
              `${article.slug}.continuation points to missing article "/${route}"`,
            );
          }
        }
      }
    }
  }

  if (importedDeeper.length !== 10) {
    errors.push(`expected 10 imported Go Deeper articles; got ${importedDeeper.length}`);
  }
  const importedOrders = importedDeeper.map((article) => article.order);
  if (!assertEqualArrays(importedOrders, importedDeeper.map((_, index) => index))) {
    errors.push(`imported Go Deeper orders must be 0 through 9; got [${importedOrders.join(", ")}]`);
  }
  for (const article of importedDeeper) {
    if (!articleRoutePattern.test(article.slug) || !article.slug.startsWith("deeper-")) {
      errors.push(`invalid imported Go Deeper slug "${article.slug}"`);
    }
    if (!isNonEmptyString(article.title)) {
      errors.push(`${article.slug}.title is empty`);
    }
    if (!isNonEmptyString(article.continuation?.label) || !isNonEmptyString(article.continuation?.href)) {
      errors.push(`${article.slug}.continuation is incomplete`);
    }
    const target = article.continuation?.href?.match(/^\/(adv|deeper)\/([a-z0-9-]+)$/);
    if (target && !catalog.has(`${target[1]}-${target[2]}`)) {
      errors.push(`${article.slug}.continuation points to missing article "${article.continuation.href}"`);
    }
  }

  for (const group of sequenceGroups) {
    const sequence = [
      ...publishedArticles.filter((article) => article?.group === group),
      ...(group === "deeper" ? importedDeeper : []),
    ]
      .sort((a, b) => a.order - b.order);
    const firstOrder = sequence[0]?.order ?? 0;
    const expectedOrders = sequence.map((_, index) => firstOrder + index);
    const actualOrders = sequence.map((article) => article.order);

    if (!sequence.length) {
      errors.push(`"${group}" sequence must contain at least one article`);
      continue;
    }
    if (!assertEqualArrays(actualOrders, expectedOrders)) {
      errors.push(
        `"${group}" sequence orders must be contiguous; got [${actualOrders.join(", ")}]`,
      );
    }

    for (let index = 0; index < sequence.length; index += 1) {
      const article = sequence[index];
      const previous = sequence[index - 1];
      const next = sequence[index + 1];
      if (previous && previous.slug === article.slug) {
        errors.push(`"${group}" previous article repeats "${article.slug}"`);
      }
      if (next && next.slug === article.slug) {
        errors.push(`"${group}" next article repeats "${article.slug}"`);
      }
    }
  }

  const publishedLinks = listSourceFiles(sourceRoot).flatMap((filePath) =>
    collectPublishedArticleSlugs(fs.readFileSync(filePath, "utf8"), filePath),
  );
  errors.push(...findMissingPublishedLinks(catalog, publishedLinks));

  return errors;
}

function assertEqualArrays(actual, expected) {
  return (
    actual.length === expected.length &&
    actual.every((value, index) => value === expected[index])
  );
}

test("article catalog and published article links are internally consistent", () => {
  const errors = validateArticleLibrary();
  assert.deepEqual(errors, [], errors.join("\n"));
});

test("retired legacy Go Deeper and More to Explore pages stay in the source catalog only", () => {
  const library = readJson(articleLibraryPath);
  const retired = library.articles.filter((article) => article.retired).map((article) => article.slug).sort();
  const retiredGoDeeper = library.articles
    .filter((article) => article.retired && article.group === "deeper")
    .map((article) => article.slug)
    .sort();
  const retiredMoreToExplore = library.articles
    .filter((article) => article.retired && article.group === "resources")
    .map((article) => article.slug)
    .sort();
  const expectedGoDeeper = [
    "deeper-assurance-of-your-salvation",
    "deeper-faith-knowing-who-you-can-trust",
    "deeper-how-to-experience-god",
    "deeper-spiritual-breathing",
  ];
  const expectedMoreToExplore = [
    "more-fleeing-temptation",
    "more-struggling-with-destructive-behavior",
    "more-the-bible",
    "more-the-holy-spirit",
  ];
  assert.deepEqual(retiredGoDeeper, expectedGoDeeper.sort());
  assert.deepEqual(retiredMoreToExplore, expectedMoreToExplore.sort());
  assert.equal(retiredGoDeeper.length, 4);
  assert.equal(retiredMoreToExplore.length, 4);
  assert.deepEqual(retired, [...expectedGoDeeper, ...expectedMoreToExplore].sort());

  const retiredSet = new Set(retired);
  const retainedFaithCompanion = "deeper-faith-knowing-god-who-is-trustworthy";
  assert.ok(readJson(importedDeeperPath).some((article) => article.slug === retainedFaithCompanion));
  assert.ok(!retiredSet.has(retainedFaithCompanion));

  for (const slug of retired) {
    assert.equal(library.articles.filter((article) => article.slug === slug).length, 1, `${slug} was removed or duplicated`);
    assert.ok(!readJson(importedDeeperPath).some((article) => article.slug === slug), `${slug} is reimported`);
    assert.ok(!readJson(linkedArticlesPath).some((article) => article.slug === slug), `${slug} is linked-only`);
    const article = library.articles.find((item) => item.slug === slug);
    assert.ok(article.title && article.excerpt && article.blocks.length > 0, `${slug} source content was deleted`);
  }
  const published = library.articles.filter((article) => !article.retired);
  for (const article of published) {
    assert.ok(!retiredSet.has(article.relatedSlug), `${article.slug} still points to retired companion ${article.relatedSlug}`);
    for (const block of article.blocks) {
      for (const href of [block.href, ...(block.links?.map((link) => link.href) ?? [])]) {
        assert.ok(!retiredSet.has(articleSlugFromHref(href)), `${article.slug} still links to ${href}`);
      }
    }
  }

  const staticLinks = listSourceFiles(sourceRoot).flatMap((filePath) =>
    collectPublishedArticleSlugs(fs.readFileSync(filePath, "utf8"), filePath),
  );
  for (const { slug, location } of staticLinks) {
    assert.ok(!retiredSet.has(slug), `${location} still publishes retired article route "/${slug}"`);
  }
});

test("published article link scanning covers page and layout entry points", () => {
  const missingSlug = "adv-missing-article";
  const fixtures = [
    {
      filePath: path.join(sourceRoot, "pages/home.tsx"),
      source: `<Link href="/${missingSlug}">Start</Link>`,
    },
    {
      filePath: path.join(sourceRoot, "components/layout.tsx"),
      source: `<Link href="/${missingSlug}">Guide</Link>`,
    },
  ];
  const publishedLinks = fixtures.flatMap(({ source, filePath }) =>
    collectPublishedArticleSlugs(source, filePath),
  );

  assert.deepEqual(
    findMissingPublishedLinks(new Map(), publishedLinks),
    fixtures.map(
      ({ filePath }) =>
        `${path.relative(projectRoot, filePath)}:1 publishes missing article route "/${missingSlug}"`,
    ),
  );
});

test("revised FAQ reading suggestions point to published resources", () => {
  const faqLinks = readJson(faqReadingLinksPath);
  const articleSlugs = new Set([
    ...readJson(articleLibraryPath).articles.filter((article) => !article.retired).map((article) => article.slug),
    ...readJson(importedDeeperPath).map((article) => article.slug),
    ...readJson(linkedArticlesPath).map((article) => article.slug),
  ]);
  const goFurtherSource = fs.readFileSync(goFurtherLibraryPath, "utf8");
  const goFurtherSlugs = new Set(
    [...goFurtherSource.matchAll(/^\s+slug: '([^']+)'/gm)].map((match) => match[1]),
  );
  const approvedExternal = new Set([
    "https://app.jesusonline.com/evidence",
    "https://app.jesusonline.com/series/73",
    "https://app.jesusonline.com/series/72",
  ]);

  for (const [faqSlug, suggestions] of Object.entries(faqLinks)) {
    assert.ok(articleSlugs.has(faqSlug), `Unknown FAQ: ${faqSlug}`);
    assert.ok(suggestions.length > 0, `No suggestions for ${faqSlug}`);
    for (const { label, href } of suggestions) {
      assert.ok(isNonEmptyString(label), `${faqSlug} has an empty reading label`);
      if (href.startsWith("/gf/")) {
        const [, , book, reading] = href.split("/");
        assert.ok(goFurtherSlugs.has(book) && goFurtherSlugs.has(reading), `${faqSlug}: unknown reading ${href}`);
      } else if (href.startsWith("/")) {
        const slug = articleSlugFromHref(href) ?? href.slice(1);
        assert.ok(articleSlugs.has(slug), `${faqSlug}: unknown article ${href}`);
      } else {
        assert.ok(approvedExternal.has(href), `${faqSlug}: unapproved external link ${href}`);
      }
    }
  }
});
