declare module "virtual:article-pages" {
  const articles: import("./data/article-catalog").ArticleSummary[];
  const companions: Record<string, string | null>;
  const loaders: Record<string, () => Promise<import("./data/article-library").Article>>;
  export { articles, companions, loaders };
}
