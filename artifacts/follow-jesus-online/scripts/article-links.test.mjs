import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const projectRoot = path.resolve(import.meta.dirname, "..");
const articleLibraryPath = path.join(
  projectRoot,
  "src/data/article-library.json",
);
const sourceRoot = path.join(projectRoot, "src");
const xpPagePath = path.join(projectRoot, "src/pages/xp-page.tsx");

const articleRoutePattern = /^(?:adv|deeper|more)-[a-z0-9-]+$/;
const sequenceGroups = ["adventure", "deeper", "received", "rededicated"];
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
    /["'`]\/((?:adv|deeper|more)-[a-z0-9-]+)["'`]/g,
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
        slug: match[1],
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

function validateArticleLibrary() {
  const library = readJson(articleLibraryPath);
  const articles = library?.articles;
  const errors = [];

  if (!Array.isArray(articles) || articles.length === 0) {
    return ["article-library.json must contain a non-empty articles array"];
  }

  const slugs = new Set();
  const catalog = new Map();

  for (const article of articles) {
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

  for (const [articleIndex, article] of articles.entries()) {
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

      const internalArticleLink =
        typeof block.href === "string" &&
        block.href.match(/^\/((?:adv|deeper|more)-[a-z0-9-]+)(?:[?#].*)?$/);
      if (internalArticleLink && !catalog.has(internalArticleLink[1])) {
        errors.push(
          `${label} links to missing article route "/${internalArticleLink[1]}"`,
        );
      }
    }

    if (article.relatedSlug && !catalog.has(article.relatedSlug)) {
      errors.push(
        `${article.slug}.relatedSlug points to missing article "${article.relatedSlug}"`,
      );
    }
  }

  for (const group of sequenceGroups) {
    const sequence = articles
      .filter((article) => article?.group === group)
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
