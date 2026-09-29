import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, ArrowRight, BookOpen, HelpCircle, Quote } from "lucide-react";
import { ScriptureRef } from "@/components/scripture-ref";
import NotFound from "@/pages/not-found";
import { ShareButton } from "@/components/share-button";
import {
  getArticleBySlug,
  getArticlePath,
  getArticlesInGroup,
  type ArticleBlock,
  type Article,
} from "@/data/article-library";
import { ArticleEndSection } from "@/components/article-end-section";
import linkedArticleMetadata from "@/data/linked-articles.json";
import { useEffect } from "react";

const BIBLE_BOOKS = [
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "1 Corinthians", "2 Corinthians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Song of Solomon", "Ecclesiastes", "Lamentations", "Deuteronomy", "Leviticus",
  "Numbers", "Philippians", "Colossians", "Ephesians", "Galatians", "Romans",
  "Hebrews", "Revelation", "Matthew", "Mark", "Luke", "John", "Acts", "Titus",
  "Philemon", "James", "Jude", "Genesis", "Exodus", "Joshua", "Judges", "Ruth",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Psalm", "Proverbs", "Isaiah",
  "Jeremiah", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah",
  "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
];

const BIBLE_REFERENCE_PATTERN = new RegExp(
  `\\b(?:${BIBLE_BOOKS.sort((a, b) => b.length - a.length)
    .map((book) => book.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&"))
    .join("|")})\\s+\\d{1,3}(?::\\d{1,3}(?:[-–—](?:\\d{1,3}:)?\\d{1,3})?(?:(?:,\\s*\\d{1,3}(?:[-–—]\\d{1,3})?)|(?:;\\s*\\d{1,3}:\\d{1,3}(?:[-–—](?:\\d{1,3}:)?\\d{1,3})?))*)?`,
  "g",
);

const WEB_ADDRESS_PATTERN =
  /(https?:\/\/[^\s]+|(?:follow\.jesusonline\.com|bible\.com|equip\.jesusonline\.com|app\.jesusonline\.com)(?:\/[^\s]*)?)/g;

function BibleText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(BIBLE_REFERENCE_PATTERN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) parts.push(text.slice(lastIndex, start));
    parts.push(
      <ScriptureRef key={`${match[0]}-${start}`} reference={match[0]}>
        {match[0]}
      </ScriptureRef>,
    );
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return <>{parts.length ? parts : text}</>;
}

function RichText({ text }: { text: string }) {
  const parts = text.split(WEB_ADDRESS_PATTERN);
  return (
    <>
      {parts.map((part, index) => {
        if (!part) return null;
        if (WEB_ADDRESS_PATTERN.test(part)) {
          WEB_ADDRESS_PATTERN.lastIndex = 0;
          const href = part.startsWith("http") ? part : `https://${part}`;
          return (
            <a
              key={`${part}-${index}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline decoration-primary/30 underline-offset-4 hover:text-primary/80"
            >
              {part}
            </a>
          );
        }
        WEB_ADDRESS_PATTERN.lastIndex = 0;
        return <BibleText key={`${part}-${index}`} text={part} />;
      })}
    </>
  );
}

function LinkedRichText({ block }: { block: ArticleBlock }) {
  if (!block.links?.length) return <RichText text={block.text} />;
  const result: React.ReactNode[] = [];
  let cursor = 0;
  for (const [index, link] of block.links.entries()) {
    const start = block.text.indexOf(link.label, cursor);
    if (start === -1) continue;
    result.push(<RichText key={`text-${index}`} text={block.text.slice(cursor, start)} />);
    result.push(
      <a
        key={`link-${index}`}
        href={link.href}
        target={link.href.startsWith("/") ? undefined : "_blank"}
        rel={link.href.startsWith("/") ? undefined : "noopener noreferrer"}
        className="text-brand underline decoration-brand/30 underline-offset-4 hover:text-brand/80"
      >
        {link.label}
      </a>,
    );
    cursor = start + link.label.length;
  }
  result.push(<RichText key="remaining" text={block.text.slice(cursor)} />);
  return <>{result}</>;
}

export function DefaultArticleBlockView({ block }: { block: ArticleBlock }) {
  if (block.type === "image" && block.src) {
    return (
      <figure className="my-8">
        <img
          src={`${import.meta.env.BASE_URL}article-images/${block.src}`}
          alt={block.text || "Illustration accompanying this article"}
          loading="lazy"
          className="mx-auto h-auto max-w-full rounded-lg"
        />
      </figure>
    );
  }
  if (block.type === "heading") {
    return (
      <h2 className="text-2xl md:text-3xl font-bold text-navy mt-12 mb-4 first:mt-0">
        <LinkedRichText block={block} />
      </h2>
    );
  }

  if (block.type === "list") {
    return (
      <li className="ml-5 pl-2 marker:text-warm-500 leading-relaxed text-navy">
        <LinkedRichText block={block} />
      </li>
    );
  }

  if (block.type === "question") {
    return (
      <div className="my-6 rounded-xl border border-warm-200 bg-warm-50 p-5 text-navy shadow-sm">
        <div className="flex items-start gap-3">
          <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-warm-700" aria-hidden="true" />
          <p className="font-medium leading-relaxed">
            <RichText text={block.text.replace(/^Q:\s*/, "")} />
          </p>
        </div>
      </div>
    );
  }

  if (block.type === "table-row") {
    return (
      <p className="rounded-lg border border-border-soft bg-surface-soft px-4 py-3 text-navy">
        <LinkedRichText block={block} />
      </p>
    );
  }

  if (block.type === "link" && block.href) {
    return (
      <p className="my-5">
        <Link
          href={block.href.replace(/^\/(adv|deeper)-/, "/$1/")}
          className="inline-flex items-center font-bold text-brand underline decoration-brand/30 underline-offset-4 hover:text-brand/80"
        >
          <RichText text={block.text} />
          <ArrowRight className="ml-2 h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      </p>
    );
  }

  return (
    <p className="leading-relaxed text-slate text-lg mb-5">
      <LinkedRichText block={block} />
    </p>
  );
}

function groupLabel(group: ArticleBlock["type"] | string) {
  if (group === "linked") return "Related Article";
  if (group === "deeper") return "Go Deeper";
  if (group === "resources") return "More Resources";
  if (group === "received") return "Questions after following Jesus";
  if (group === "rededicated") return "Questions for returning to Jesus";
  if (group === "believer") return "Resources for existing believers";
  if (group === "no-decision") return "Questions before a decision";
  return "Adventure Guide";
}

function AdventureBlockView({ block }: { block: ArticleBlock }) {
  if (block.type === "image") return <DefaultArticleBlockView block={block} />;
  if (block.type === "heading") {
    return (
      <h2 className="text-2xl sm:text-3xl font-bold text-navy mt-14 mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center gap-3">
        <span className="w-12 h-px bg-warm-300 hidden sm:block"></span>
        <LinkedRichText block={block} />
      </h2>
    );
  }

  if (block.type === "list") {
    return (
      <li className="relative pl-8 leading-relaxed text-slate text-lg sm:text-[19px] font-sans mb-4">
        <span className="absolute left-1 top-2.5 w-2 h-2 rounded-full bg-warm-200 border border-warm-400"></span>
        <LinkedRichText block={block} />
      </li>
    );
  }

  if (block.type === "question") {
    return (
      <div className="not-prose my-3 rounded-lg border-l-4 border-warm-500 bg-warm-50 px-4 py-2 sm:px-5">
        <span className="block text-[11px] font-semibold leading-snug text-warm-700">REFLECT:</span>
        <p className="m-0 text-lg leading-snug text-navy sm:text-xl">
          <RichText text={block.text.replace(/^(?:Q:|Your thoughts:)\s*/i, "")} />
        </p>
      </div>
    );
  }

  if (block.type === "table-row") {
    return (
      <div className="my-8 border-l-4 border-warm-500 bg-warm-50/40 px-6 py-5 rounded-r-xl">
        <p className="text-lg italic text-navy leading-relaxed">
          <LinkedRichText block={block} />
        </p>
      </div>
    );
  }

  if (block.type === "link" && block.href) {
    return (
      <p className="my-8 text-center sm:text-left">
        <Link
          href={block.href.replace(/^\/(adv|deeper)-/, "/$1/")}
          className="inline-flex items-center font-bold text-blue-700 bg-blue-50 px-5 py-2.5 rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors"
        >
          <RichText text={block.text} />
          <ArrowRight className="ml-2 h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      </p>
    );
  }

  const isQuote = block.text.startsWith("“") || block.text.startsWith("\"");
  if (isQuote) {
    return (
      <div className="my-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-full border border-warm-300 flex items-center justify-center text-warm-500 bg-white shadow-sm mt-2 hidden sm:flex">
           <Quote className="w-6 h-6 sm:w-7 sm:h-7 stroke-1" />
        </div>
        <div className="rounded-xl bg-warm-50/70 p-6 sm:p-8 text-navy flex-1 w-full">
          <p className="text-xl sm:text-2xl leading-relaxed text-navy italic">
            <LinkedRichText block={block} />
          </p>
        </div>
      </div>
    );
  }

  return (
    <p className="leading-relaxed text-slate text-lg sm:text-[19px] mb-6 font-sans">
      <LinkedRichText block={block} />
    </p>
  );
}

function AdventureArticleView({
  article,
  groupArticles,
  articleIndex,
  articleHref,
}: {
  article: Article;
  groupArticles: Article[];
  articleIndex: number;
  articleHref: (slug: string) => string;
}) {
  const previous = groupArticles[articleIndex - 1];
  const next = groupArticles[articleIndex + 1];
  const deeperArticle = article.relatedSlug ? getArticleBySlug(article.relatedSlug) : undefined;
  const blocks = article.blocks;

  return (
    <Layout>
      <div className="min-h-[100dvh] bg-[#F7F1E6] pb-20">
        <main className="container mx-auto max-w-3xl px-5 py-8 sm:px-8 md:py-10">
          <nav aria-label="Breadcrumb" className="mb-10 text-sm text-slate">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link href="/explore-articles" className="font-medium text-navy hover:text-brand hover:underline">
                  Adventure Guide
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate/40">/</li>
              <li aria-current="page" className="text-slate">
                Chapter {articleIndex + 1}
              </li>
            </ol>
          </nav>

          <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-12 text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-px bg-warm-300 w-12 sm:w-24"></div>
                <span className="text-warm-700 font-bold tracking-[0.15em] uppercase text-xs sm:text-sm">
                  Chapter {articleIndex + 1}
                </span>
                <div className="h-px bg-warm-300 w-12 sm:w-24"></div>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-serif font-bold text-navy uppercase tracking-tight leading-[1.15] mb-8">
                {article.title}
              </h1>
              <ShareButton
                title={`${article.title} | Follow Jesus Online`}
                text={`Read “${article.title}” from Follow Jesus Online.`}
                label="Share this article"
                variant="ghost"
                className="h-8 rounded-full px-3 text-xs font-medium text-slate hover:bg-warm-50 hover:text-navy"
              />
            </header>

            <div className="prose prose-lg max-w-none prose-p:font-sans prose-headings:font-sans">
              <div className="space-y-6">
                {blocks.map((block, index) => {
                  if (block.type === "list") {
                    const previousBlock = blocks[index - 1];
                    if (previousBlock?.type === "list") return null;
                    const listItems = blocks.slice(index).slice(0, blocks.slice(index).findIndex((item) => item.type !== "list") < 0
                      ? blocks.length - index
                      : blocks.slice(index).findIndex((item) => item.type !== "list"));
                    return (
                      <ul key={index} className="my-8 list-none space-y-3 pl-0">
                        {listItems.map((item, itemIndex) => (
                          <AdventureBlockView key={itemIndex} block={item} />
                        ))}
                      </ul>
                    );
                  }
                  return <AdventureBlockView key={index} block={block} />;
                })}
              </div>
            </div>

            <p className="mt-8 text-lg leading-relaxed text-slate">
              Keep walking. If you want more on what you just read, pause here first.
            </p>

            <ArticleEndSection
              articleSlug={article.slug}
              navigationId="adventure-next-steps"
              next={next ? { href: articleHref(next.slug), title: next.title, label: "Read the next chapter" } : undefined}
              secondary={deeperArticle ? {
                href: articleHref(deeperArticle.slug),
                title: deeperArticle.title,
                label: "Go Deeper (optional)",
              } : undefined}
              previous={previous ? {
                href: articleHref(previous.slug),
                label: "Back to the previous chapter",
              } : undefined}
            />
          </article>
        </main>
      </div>
    </Layout>
  );
}

export function ArticlePlaceholder() {
  const params = useParams();
  const [location] = useLocation();
  const routeGroup = location.split("?")[0].split("/").filter(Boolean)[0];
  const articleSlug =
    routeGroup === "adv" || routeGroup === "deeper"
      ? `${routeGroup}-${params.slug || ""}`
      : params.slug || "";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [articleSlug]);

  const article = getArticleBySlug(articleSlug);
  if (!article) return <NotFound />;

  const groupArticles = getArticlesInGroup(article.group);
  const articleIndex = groupArticles.findIndex((item) => item.slug === article.slug);
  const guideArticles = article.group === "deeper" ? getArticlesInGroup("adventure") : [];
  const mainGuideArticle = guideArticles.find((item) => item.relatedSlug === article.slug);
  const mainGuideIndex = mainGuideArticle
    ? guideArticles.findIndex((item) => item.slug === mainGuideArticle.slug)
    : -1;
  const nextGuideArticle = mainGuideIndex >= 0 ? guideArticles[mainGuideIndex + 1] : undefined;
  const blocks = article.blocks;
  const linkedSource = article.group === "linked"
    ? linkedArticleMetadata.find((item) => item.slug === article.slug)
    : undefined;
  const firstParagraphIndex = blocks.findIndex((block) => block.type === "paragraph");
  const currentSearch = new URLSearchParams(
    typeof window === "undefined" ? "" : window.location.search,
  );

  const articleHref = (slug: string) => {
    const journey = currentSearch.get("journey");
    if (!journey) return getArticlePath(slug);

    const journeyParams = new URLSearchParams({
      journey,
      entry: currentSearch.get("entry") || "direct",
      from: "faq",
      step: "faq",
    });
    return `${getArticlePath(slug)}?${journeyParams.toString()}`;
  };

  if (article.group === "adventure") {
    return (
      <AdventureArticleView
        article={article}
        groupArticles={groupArticles}
        articleIndex={articleIndex}
        articleHref={articleHref}
      />
    );
  }

  return (
    <Layout>
      <main className="container mx-auto max-w-4xl px-5 py-8 sm:px-8 md:py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" className="-ml-4 text-muted-foreground hover:text-foreground">
             <Link href={linkedSource ? getArticlePath(linkedSource.faqSlug) : "/explore-articles"}>
               <ArrowLeft className="w-4 h-4 mr-2" /> {linkedSource ? "Back to question" : "Back to Articles"}
            </Link>
          </Button>
           {article.group !== "linked" && (
             <span className="text-sm text-muted-foreground">
               {articleIndex + 1} of {groupArticles.length}
             </span>
           )}
        </div>

        <article className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <header className="mb-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy">
              <BookOpen className="h-3.5 w-3.5" /> {groupLabel(article.group)}
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-navy md:text-6xl">
              {article.title}
            </h1>
            {firstParagraphIndex >= 0 && (
              <p className="mt-6 max-w-3xl text-xl leading-relaxed text-slate">
                <LinkedRichText block={blocks[firstParagraphIndex]} />
              </p>
            )}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ShareButton
                title={`${article.title} | Follow Jesus Online`}
                text={`Read “${article.title}” from Follow Jesus Online.`}
                label="Share this article"
              />
            </div>
          </header>

          <div className="rounded-2xl border border-border-soft bg-white p-7 shadow-sm sm:p-10 md:p-12">
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div className="space-y-5">
                {blocks.map((block, index) => {
                  if (index === firstParagraphIndex) return null;
                   if (article.group === "deeper" && block.type === "question") return null;
                  if (block.type === "list") {
                    const previousBlock = blocks[index - 1];
                    if (previousBlock?.type === "list") return null;
                    const listItems = blocks.slice(index).slice(0, blocks.slice(index).findIndex((item) => item.type !== "list") < 0
                      ? blocks.length - index
                      : blocks.slice(index).findIndex((item) => item.type !== "list"));
                    return (
                      <ul key={index} className="my-5 list-disc space-y-3 pl-2">
                        {listItems.map((item, itemIndex) => (
                          <DefaultArticleBlockView key={itemIndex} block={item} />
                        ))}
                      </ul>
                    );
                  }
                  return <DefaultArticleBlockView key={index} block={block} />;
                })}
              </div>
            </div>
          </div>

          <ArticleEndSection
            articleSlug={article.slug}
            next={nextGuideArticle ? {
              href: articleHref(nextGuideArticle.slug),
              title: nextGuideArticle.title,
              label: "Read the next chapter",
            } : undefined}
            secondary={mainGuideArticle ? {
              href: articleHref(mainGuideArticle.slug),
              title: mainGuideArticle.title,
              label: "Back to the chapter",
              back: true,
            } : undefined}
          />
        </article>
      </main>
    </Layout>
  );
}
