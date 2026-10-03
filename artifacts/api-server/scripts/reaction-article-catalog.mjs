import { readFile } from "node:fs/promises";
import { transform } from "esbuild";

const dataRoot = new URL("../../follow-jesus-online/src/data/", import.meta.url);

// Match the published article sources, not a slug prefix or a manually maintained list.
// The API build embeds this catalog so runtime requests never read client files.
export async function reactionArticleSlugs() {
  const [library, deeper, linked, goFurtherSource] = await Promise.all([
    readFile(new URL("article-library.json", dataRoot), "utf8").then(JSON.parse),
    readFile(new URL("imported-deeper-articles.json", dataRoot), "utf8").then(JSON.parse),
    readFile(new URL("linked-articles.json", dataRoot), "utf8").then(JSON.parse),
    readFile(new URL("go-further-library.ts", dataRoot), "utf8"),
  ]);
  const { code } = await transform(goFurtherSource, { loader: "ts", format: "esm" });
  const { GO_FURTHER_BOOKS } = await import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
  const slugs = [
    ...library.articles.filter((article) => !article.retired).map((article) => article.slug),
    ...deeper.map((article) => article.slug),
    ...linked.map((article) => article.slug),
    ...GO_FURTHER_BOOKS.flatMap((book) =>
      [...book.readings, ...(book.introChapter ? [book.introChapter] : [])]
        .map((reading) => `gf-${book.slug}-${reading.slug}`),
    ),
  ];
  if (!slugs.length || slugs.some((slug) => typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug))) {
    throw new Error("Invalid reaction article catalog.");
  }
  return [...new Set(slugs)].sort();
}