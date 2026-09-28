import library from "./article-library.json";
import importedDeeperArticles from "./imported-deeper-articles.json";
import linkedArticleMetadata from "./linked-articles.json";
import generatedContent from "virtual:article-content";

export type ArticleGroup =
  | "adventure"
  | "deeper"
  | "resources"
  | "received"
  | "rededicated"
  | "believer"
  | "no-decision"
  | "linked";

export type ArticleBlock = {
  type: "heading" | "paragraph" | "question" | "list" | "table-row" | "link" | "image";
  text: string;
  href?: string;
  src?: string;
  links?: { label: string; href: string }[];
};

export type ArticleContinuation = {
  label: string;
  href: string;
};

export type Article = {
  slug: string;
  title: string;
  group: ArticleGroup;
  order: number;
  excerpt: string;
  blocks: ArticleBlock[];
  relatedSlug?: string;
  continuation?: ArticleContinuation;
};

const updatedBySlug = new Map(
  generatedContent
    .filter((record) => record.category === "ZIP Updated")
    .map((record) => [record.route.slice(1), record]),
);

const linkedFromFaq = new Map(
  linkedArticleMetadata.map(({ faqSlug, slug, title }) => [
    faqSlug,
    { text: `Read more: ${title}`, href: `/${slug}` },
  ]),
);

const linkedArticles: Article[] = generatedContent
  .filter((record) => record.category === "Linked only")
  .map((record, order) => ({
    slug: record.route.slice(1),
    title: record.title,
    group: "linked",
    order,
    excerpt: record.blocks.find((block) => block.kind === "paragraph" && block.text !== record.title)?.text
      ?? "A Follow Jesus Online resource.",
    blocks: record.blocks
      .filter((block, index) => !(index === 0 && block.text.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase() === record.title.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase()))
      .map((block) => ({ type: block.kind, text: block.text, src: block.src, links: block.links })),
  }));

const adventureCompanions: Record<string, string> = {
  "adv-begin-the-adventure": "deeper-the-need-for-a-new-heart",
  "adv-citizen-of-heaven": "deeper-the-gift-of-eternal-life",
  "adv-your-new-identity-christ": "deeper-embracing-your-new-identity-in-christ",
  "adv-the-holy-spirit": "deeper-living-an-empowered-life",
  "adv-walking-by-faith": "deeper-faith-knowing-god-who-is-trustworthy",
  "adv-gods-word": "deeper-renewing-the-mind-for-transformation",
  "adv-prayer": "deeper-the-lords-prayer-guide",
  "adv-belonging-to-gods-family": "deeper-belong-and-become",
  "adv-living-a-life-of-purpose": "deeper-gods-plan-for-you",
  "adv-continuing-with-jesus": "deeper-your-journey-continues",
};

const importedDeeperBySlug = new Map(
  importedDeeperArticles.map((article) => [article.slug, article]),
);

const importedDeeperRecords: Article[] = generatedContent
  .filter((record) => record.category === "ZIP Updated" && importedDeeperBySlug.has(record.route.slice(1)))
  .map((record) => {
    const metadata = importedDeeperBySlug.get(record.route.slice(1))!;
    const blocks: ArticleBlock[] = record.blocks
      .filter((block) => {
        const text = block.text.trim();
        return (
          text !== "JesusOnline FOLLOW" &&
          !/^Go Deeper\s*·/.test(text) &&
          !/^Your Journey Continues\s*·/.test(text) &&
          text !== record.title &&
          !text.startsWith("A free resource from JesusOnline Ministries") &&
          !text.startsWith("Companion to The Adventure of Living with Jesus") &&
          !text.startsWith("After The Adventure of Living with Jesus") &&
          !text.startsWith("Begin in the JO FOLLOW")
        );
      })
      .map((block) => {
        const text = block.text.trim();
        const isShortNumberedHeading = /^\d+\.\s+\S/.test(text) && text.length < 80;
        return {
          type:
            block.kind === "paragraph" && (text === "Overview" || isShortNumberedHeading)
              ? "heading"
              : block.kind === "paragraph" && text.endsWith("?")
                ? "question"
                : block.kind,
          text: block.text,
          src: block.src,
          links: block.links,
        };
      });
    const excerpt =
      blocks.find((block) => block.type === "paragraph")?.text ??
      "A Go Deeper companion from Follow Jesus Online.";
    return {
      slug: metadata.slug,
      title: record.title,
      group: "deeper",
      order: metadata.order,
      excerpt,
      blocks,
      continuation: metadata.continuation,
    };
  });

export const ARTICLE_LIBRARY = [
  ...(library.articles as Article[]).map((article) => {
    const updated = updatedBySlug.get(article.slug);
    const relatedLink = linkedFromFaq.get(article.slug);
    const blocks = updated
      ? updated.blocks
        .filter((block, index) => !(index === 0 && block.kind === "heading" && block.text === updated.title))
        .map((block) => ({ type: block.kind, text: block.text, src: block.src, links: block.links }))
      : article.blocks;
    return {
      ...article,
      ...(updated
        ? {
            title: updated.title,
            excerpt:
              updated.blocks.find((block) => block.kind === "paragraph")?.text ??
              article.excerpt,
            blocks,
          }
        : {}),
      ...(relatedLink ? {
        blocks: [...blocks, { type: "link" as const, ...relatedLink }],
      } : {}),
      order: article.group === "deeper" ? article.order + importedDeeperArticles.length : article.order,
      relatedSlug: adventureCompanions[article.slug] ?? article.relatedSlug,
    };
  }),
  ...importedDeeperRecords,
  ...linkedArticles,
];

export function getArticleBySlug(slug: string) {
  return ARTICLE_LIBRARY.find((article) => article.slug === slug);
}

export function getArticlePath(slug: string) {
  if (slug.startsWith("adv-")) return `/adv/${slug.slice("adv-".length)}`;
  if (slug.startsWith("deeper-")) return `/deeper/${slug.slice("deeper-".length)}`;
  return `/${slug}`;
}

export function getArticleSlugFromPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 2 && (segments[0] === "adv" || segments[0] === "deeper")) {
    return `${segments[0]}-${segments[1]}`;
  }
  return segments.length === 1 ? segments[0] : undefined;
}

export function getArticlesInGroup(group: ArticleGroup) {
  return ARTICLE_LIBRARY
    .filter((article) => article.group === group)
    .sort((a, b) => a.order - b.order);
}