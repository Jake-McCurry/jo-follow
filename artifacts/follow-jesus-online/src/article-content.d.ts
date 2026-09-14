declare module "virtual:article-content" {
  export type ArticleBlock = {
    kind: "heading" | "paragraph" | "list";
    text: string;
  };

  export type ArticleRecord = {
    route: string;
    title: string;
    category: string;
    blocks: ArticleBlock[];
  };

  const articles: ArticleRecord[];
  export default articles;
}