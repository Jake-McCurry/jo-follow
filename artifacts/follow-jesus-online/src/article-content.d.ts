declare module "virtual:article-content" {
  export type ArticleBlock = {
    kind: "heading" | "paragraph" | "question" | "list" | "image";
    text: string;
    src?: string;
    links?: { label: string; href: string }[];
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