// Injected from the site's content catalogs by build.mjs. Fail closed if the
// build has not supplied the catalog; never accept arbitrary slugs.
declare const __REACTION_ARTICLE_SLUGS__: readonly string[];

const reactionArticles = new Set(__REACTION_ARTICLE_SLUGS__);

export function isReactionArticle(slug: string): boolean {
  return reactionArticles.has(slug);
}