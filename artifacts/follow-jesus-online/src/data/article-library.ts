import library from "./article-library.json";
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

export type Article = {
  slug: string;
  title: string;
  group: ArticleGroup;
  order: number;
  excerpt: string;
  blocks: ArticleBlock[];
  relatedSlug?: string;
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

export const ARTICLE_LIBRARY = [
  ...(library.articles as Article[]).filter(
    (article) => !generatedFaqSlugs.has(article.slug),
  ),
  ...generatedFaqArticles,
];

export function getArticleBySlug(slug: string) {
  return ARTICLE_LIBRARY.find((article) => article.slug === slug);
}

export function getArticlesInGroup(group: ArticleGroup) {
  return ARTICLE_LIBRARY
    .filter((article) => article.group === group)
    .sort((a, b) => a.order - b.order);
}