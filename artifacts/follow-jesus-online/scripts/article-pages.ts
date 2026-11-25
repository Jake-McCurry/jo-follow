import type { Plugin } from "vite";
import { buildArticleLibrary, getOriginalGuideSlugForDeeper, type Article } from "../src/data/article-library";

const CATALOG = "virtual:article-pages";
const PAGE = "virtual:article-page/";
export const ARTICLE_PAGE_PREFIX = `\0${PAGE}`;

/** Run the unchanged editorial assembly at build time, then split its result. */
export function articlePagesPlugin(source: () => Parameters<typeof buildArticleLibrary>[0]): Plugin {
  let articles: Article[] | undefined;
  const library = () => articles ??= buildArticleLibrary(source());
  return {
    name: "follow-article-pages",
    resolveId(id) {
      if (id === CATALOG || id.startsWith(PAGE)) return `\0${id}`;
    },
    load(id) {
      if (id === `\0${CATALOG}`) {
        const summaries = library().map(({ blocks: _blocks, ...summary }) => summary);
        const companions = Object.fromEntries(library().filter(article => article.group === "deeper").map(article => [
          article.slug,
          library().find(guide => guide.group === "adventure" && guide.relatedSlug === article.slug)?.slug
            ?? getOriginalGuideSlugForDeeper(article.slug) ?? null,
        ]));
        const loaders = library().map(article =>
          `${JSON.stringify(article.slug)}:()=>import(${JSON.stringify(`${PAGE}${article.slug}`)}).then(m=>m.default)`);
        return `export const articles=${JSON.stringify(summaries)};export const companions=${JSON.stringify(companions)};export const loaders={${loaders.join(",")}};`;
      }
      if (id.startsWith(ARTICLE_PAGE_PREFIX)) {
        const slug = id.slice(ARTICLE_PAGE_PREFIX.length);
        const article = library().find(article => article.slug === slug);
        if (!article) throw new Error(`Unknown article chunk: ${slug}`);
        return `export default ${JSON.stringify(article)};`;
      }
    },
  };
}
