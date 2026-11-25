import { articles, companions, loaders } from "virtual:article-pages";
import type { Article, ArticleGroup } from "./article-library";
import { createArticleContentLoader } from "../lib/article-content-loader";
export type { Article, ArticleBlock, ArticleGroup } from "./article-library";
export { getArticlePath, getArticleSlugFromPath } from "./article-routing";

export type ArticleSummary = Omit<Article, "blocks">;
const content = createArticleContentLoader(loaders);

export function getArticleBySlug(slug: string): ArticleSummary | undefined {
  return articles.find(article => article.slug === slug);
}

export function getArticlesInGroup(group: ArticleGroup): ArticleSummary[] {
  return articles.filter(article => article.group === group).sort((a, b) => a.order - b.order);
}

export function getGuideArticleForDeeper(slug: string) {
  const guide = companions[slug];
  return guide ? getArticleBySlug(guide) : undefined;
}

export const getLoadedArticle = content.get;
export const loadArticle = content.load;
