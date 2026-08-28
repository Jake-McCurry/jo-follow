import library from "./article-library.json";

export type ArticleGroup = "adventure" | "deeper" | "resources" | "received" | "rededicated";

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

export const ARTICLE_LIBRARY = library.articles as Article[];

export function getArticleBySlug(slug: string) {
  return ARTICLE_LIBRARY.find((article) => article.slug === slug);
}

export function getArticlesInGroup(group: ArticleGroup) {
  return ARTICLE_LIBRARY
    .filter((article) => article.group === group)
    .sort((a, b) => a.order - b.order);
}