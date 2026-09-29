import { useParams } from "wouter";
import { getGFBook } from "@/data/go-further-library";
import NotFound from "@/pages/not-found";
import { ArticleEndSection } from "@/components/article-end-section";
import { BookChapterFrame } from "@/components/book-chapter-frame";
import articleContent from "virtual:article-content";
import { AdventureArticleBlocks } from "@/pages/article-placeholder";
import type { ArticleBlock } from "@/data/article-library";

export function GFReadingPage() {
  const params = useParams();
  
  const book = getGFBook(params.bookSlug || "");
  if (!book) return <NotFound />;

  const readingIndex = book.readings.findIndex((r) => r.slug === params.readingSlug);
  if (readingIndex === -1) return <NotFound />;

  const reading = book.readings[readingIndex];
  const previous = book.readings[readingIndex - 1] ?? (readingIndex === 0 ? book.introChapter : undefined);
  const next = book.readings[readingIndex + 1];
  const article = articleContent.find((item) =>
    item.route === `/gf/${book.slug}/${reading.slug}`,
  );
  if (!article || article.blocks.length === 0) return <NotFound />;
  const titleText = (text: string) => text.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
  const blocks = titleText(article.blocks[0].text) === titleText(article.title)
    ? article.blocks.slice(1)
    : article.blocks;
  const chapterBlocks: ArticleBlock[] = blocks.map((block) => ({
    type: block.kind,
    text: block.text,
    src: block.src,
    links: block.links,
  }));

  return (
    <BookChapterFrame
      bookTitle={book.title}
      bookHref={`/gf/${book.slug}`}
      chapterLabel={`Chapter ${readingIndex + 1}`}
      title={reading.title.replace(/^\d+\.\s*/, "")}
    >
        <p className="mb-10 text-lg leading-relaxed text-slate sm:text-[19px]">
          {reading.desc}
        </p>
        <AdventureArticleBlocks blocks={chapterBlocks} />
        <ArticleEndSection
          articleSlug={`gf-${book.slug}-${reading.slug}`}
          next={next ? {
            href: `/gf/${book.slug}/${next.slug}`,
            title: next.title,
            label: "Read the next chapter",
          } : undefined}
          previous={previous ? {
            href: `/gf/${book.slug}/${previous.slug}`,
            label: readingIndex === 0 ? "Back to the introduction" : "Back to the previous chapter",
          } : undefined}
        />
    </BookChapterFrame>
  );
}
