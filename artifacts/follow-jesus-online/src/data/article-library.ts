import library from "./article-library.json";
import importedDeeperArticles from "./imported-deeper-articles.json";
import generatedContent from "virtual:article-content";

export type ArticleGroup =
  | "adventure"
  | "deeper"
  | "resources"
  | "received"
  | "rededicated"
  | "believer"
  | "no-decision";

export type ArticleBlock = {
  type: "heading" | "paragraph" | "question" | "list" | "table-row" | "link";
  text: string;
  href?: string;
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

const BELIEVER_PREFIX = "more-believer-";
const NO_DECISION_PREFIX = "more-no-decision-";

const generatedFaqRecords = generatedContent.filter((record) => {
  const slug = record.route.slice(1);
  return slug.startsWith(BELIEVER_PREFIX) || slug.startsWith(NO_DECISION_PREFIX);
});

const groupOrders: Record<"believer" | "no-decision", number> = {
  believer: 0,
  "no-decision": 0,
};

const generatedFaqArticles: Article[] = generatedFaqRecords.map((record) => {
  const group: "believer" | "no-decision" = record.route.slice(1).startsWith(BELIEVER_PREFIX)
    ? "believer"
    : "no-decision";
  const blocks = record.blocks
    .filter(
      (block, index) =>
        !(index === 0 && block.kind === "heading" && block.text === record.title),
    )
    .map((block) => ({
      type: block.kind,
      text: block.text,
    }));
  const excerpt =
    blocks.find((block) => block.type === "paragraph")?.text ??
    "A Follow Jesus Online resource.";

  return {
    slug: record.route.slice(1),
    title: record.title,
    group,
    order: groupOrders[group]++,
    excerpt,
    blocks,
  };
});

const generatedFaqSlugs = new Set(generatedFaqArticles.map((article) => article.slug));

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
  .filter((record) => importedDeeperBySlug.has(record.route.slice(1)))
  .map((record) => {
    const metadata = importedDeeperBySlug.get(record.route.slice(1))!;
    const blocks: ArticleBlock[] = record.blocks
      .filter((block) => {
        const text = block.text.trim();
        return (
          text !== "JesusOnline FOLLOW" &&
          !/^Go Deeper\s*·/.test(text) &&
          !/^Your Journey Continues\s*·/.test(text) &&
          text !== metadata.title &&
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
        };
      });
    const excerpt =
      blocks.find((block) => block.type === "paragraph")?.text ??
      "A Go Deeper companion from Follow Jesus Online.";
    return {
      slug: metadata.slug,
      title: metadata.title,
      group: "deeper",
      order: metadata.order,
      excerpt,
      blocks,
      continuation: metadata.continuation,
    };
  });

export const ARTICLE_LIBRARY = [
  ...(library.articles as Article[]).filter(
    (article) => !generatedFaqSlugs.has(article.slug),
  ).map((article) => ({
    ...article,
    order: article.group === "deeper" ? article.order + importedDeeperArticles.length : article.order,
    relatedSlug: adventureCompanions[article.slug] ?? article.relatedSlug,
  })),
  ...importedDeeperRecords,
  ...generatedFaqArticles,
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