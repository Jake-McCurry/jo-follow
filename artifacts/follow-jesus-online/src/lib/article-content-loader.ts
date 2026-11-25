import type { Article } from "../data/article-library";

export function createArticleContentLoader(loaders: Record<string, () => Promise<Article>>) {
  const loaded = new Map<string, Article>();
  const pending = new Map<string, Promise<Article>>();
  return {
    get: (slug: string) => loaded.get(slug),
    load(slug: string): Promise<Article> {
      const cached = loaded.get(slug);
      if (cached) return Promise.resolve(cached);
      const existing = pending.get(slug);
      if (existing) return existing;
      const loader = Object.hasOwn(loaders, slug) ? loaders[slug] : undefined;
      if (!loader) return Promise.reject(new Error(`Article not found: ${slug}`));
      const request = loader().then(article => {
        if (article.slug !== slug || !Array.isArray(article.blocks)) throw new Error(`Invalid article content: ${slug}`);
        loaded.set(slug, article);
        pending.delete(slug);
        return article;
      }).catch(error => {
        pending.delete(slug);
        throw error;
      });
      pending.set(slug, request);
      return request;
    },
  };
}
