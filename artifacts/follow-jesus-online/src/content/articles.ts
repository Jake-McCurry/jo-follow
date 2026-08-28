import articleLibrary from "virtual:article-content";

export type { ArticleBlock, ArticleRecord } from "virtual:article-content";

export const ARTICLES = articleLibrary;

export function findArticle(route: string) {
  return ARTICLES.find((article) => article.route === route);
}