import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { getGFBook } from "@/data/go-further-library";
import { ArrowLeft, BookOpen } from "lucide-react";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { ArticleEndSection } from "@/components/article-end-section";
import articleContent from "virtual:article-content";
import { DefaultArticleBlockView } from "@/pages/article-placeholder";

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

  return (
    <Layout>
      <main className="container mx-auto max-w-3xl px-5 py-8 sm:px-8 md:py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" className="-ml-4 text-slate hover:text-navy hover:bg-warm-50">
            <Link href={`/gf/${book.slug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to {book.title}
            </Link>
          </Button>
          <span className="text-sm font-bold text-slate uppercase tracking-wider">
            Reading {readingIndex + 1} of {book.readings.length}
          </span>
        </div>

        <article className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <header className="mb-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy">
              <BookOpen className="h-3.5 w-3.5" /> {book.title}
            </div>
            <h1 className="text-3xl font-serif font-bold leading-tight text-navy md:text-5xl mb-6">
              {reading.title}
            </h1>
            <p className="text-xl text-slate leading-relaxed border-l-4 border-brand/30 pl-4 italic">
              {reading.desc}
            </p>
          </header>

          <div className="prose prose-lg max-w-none text-slate">
            {blocks.map((block, index) => (
              <DefaultArticleBlockView key={`${index}-${block.kind}`} block={{ type: block.kind, text: block.text, src: block.src, links: block.links }} />
            ))}
          </div>
        </article>

        <ArticleEndSection
          articleSlug={`gf-${book.slug}-${reading.slug}`}
          next={next ? {
            href: `/gf/${book.slug}/${next.slug}`,
            title: next.title,
            label: "Read the next reading",
          } : undefined}
          previous={previous ? {
            href: `/gf/${book.slug}/${previous.slug}`,
            label: readingIndex === 0 ? "Back to the introduction" : "Back to the previous reading",
          } : undefined}
        />
      </main>
    </Layout>
  );
}
