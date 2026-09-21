import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, ArrowRight, BookOpen, MessageCircle, Quote } from "lucide-react";
import { ScriptureRef } from "@/components/scripture-ref";
import { useTrackRecentPage } from "@/hooks/use-recent-page";
import NotFound from "@/pages/not-found";
import { ShareButton } from "@/components/share-button";
import {
  getArticleBySlug,
  getArticlePath,
  getArticlesInGroup,
  type ArticleBlock,
  type Article,
} from "@/data/article-library";
import { ArticleReaction } from "@/components/article-reaction";

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

const NET_COPYRIGHT =
  "Scripture quoted by permission. Quotations designated (NET) are from the NET Bible® copyright ©1996, 2019 by Biblical Studies Press, L.L.C. http://netbible.com All rights reserved.";

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

function DefaultArticleBlockView({ block }: { block: ArticleBlock }) {
  if (block.type === "heading") {
    return (
      <h2 className="text-2xl md:text-3xl font-bold text-navy mt-12 mb-4 first:mt-0">
        <RichText text={block.text} />
      </h2>
    );
  }

  if (block.type === "list") {
    return (
      <li className="ml-5 pl-2 marker:text-warm-500 leading-relaxed text-navy">
        <RichText text={block.text} />
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
        <RichText text={block.text} />
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
      <RichText text={block.text} />
    </p>
  );
}

function groupLabel(group: ArticleBlock["type"] | string) {
  if (group === "deeper") return "Go Deeper";
  if (group === "resources") return "More Resources";
  if (group === "received") return "Questions after following Jesus";
  if (group === "rededicated") return "Questions for returning to Jesus";
  if (group === "believer") return "Resources for existing believers";
  if (group === "no-decision") return "Questions before a decision";
  return "Adventure Guide";
}

function AdventureBlockView({ block }: { block: ArticleBlock }) {
  if (block.type === "heading") {
    return (
      <h2 className="text-2xl sm:text-3xl font-bold text-navy mt-14 mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center gap-3">
        <span className="w-12 h-px bg-warm-300 hidden sm:block"></span>
        <RichText text={block.text} />
      </h2>
    );
  }

  if (block.type === "list") {
    return (
      <li className="relative pl-8 leading-relaxed text-slate text-lg sm:text-[19px] font-sans mb-4">
        <span className="absolute left-1 top-2.5 w-2 h-2 rounded-full bg-warm-200 border border-warm-400"></span>
        <RichText text={block.text} />
      </li>
    );
  }

  if (block.type === "question") {
    return (
      <div className="my-5 rounded-lg border-l-4 border-warm-500 bg-warm-50 px-4 py-3 sm:px-5">
        <p className="text-lg leading-snug text-navy sm:text-xl">
          <RichText text={block.text.replace(/^Q:\s*/, "")} />
        </p>
      </div>
    );
  }

  if (block.type === "table-row") {
    return (
      <div className="my-8 border-l-4 border-warm-500 bg-warm-50/40 px-6 py-5 rounded-r-xl">
        <p className="text-lg italic text-navy leading-relaxed">
          <RichText text={block.text} />
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
            <RichText text={block.text} />
          </p>
        </div>
      </div>
    );
  }

  return (
    <p className="leading-relaxed text-slate text-lg sm:text-[19px] mb-6 font-sans">
      <RichText text={block.text} />
    </p>
  );
}

function AdventureArticleView({
  article,
  groupArticles,
  articleIndex,
  articleHref,
  continuationHref,
}: {
  article: Article;
  groupArticles: Article[];
  articleIndex: number;
  articleHref: (slug: string) => string;
  continuationHref: (href: string) => string;
}) {
  const next = groupArticles[articleIndex + 1];
  const deeperArticle = article.relatedSlug ? getArticleBySlug(article.relatedSlug) : undefined;
  const blocks = article.blocks;

  return (
    <Layout>
      <div className="bg-paper min-h-[100dvh] pb-20">
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

            <div id="adventure-next-steps" className="mt-16 scroll-mt-6 border-t border-border-soft pt-8">
               <p className="mb-4 text-sm italic text-slate">
                 Keep walking. If you want more on what you just read, pause here first.
               </p>

               <div className="mb-8 grid overflow-hidden rounded-xl border border-warm-200 shadow-sm sm:grid-cols-[1.3fr_0.7fr]">
                 <Link
                   href={next ? articleHref(next.slug) : article.continuation ? continuationHref(article.continuation.href) : "/explore-articles"}
                   className="group block border-t-4 border-warm-500 bg-blue-900 p-5 transition-colors hover:bg-blue-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:p-7"
                 >
                   <div>
                     <p className="text-sm font-bold uppercase tracking-wider text-blue-100">Read the next chapter</p>
                     <h2 className="mt-2 flex items-start justify-between gap-4 font-serif text-2xl font-bold leading-tight text-white sm:text-3xl">
                       <span>{next ? next.title : article.continuation?.label ?? "You’ve finished the guide"}</span>
                       <ArrowRight className="mt-0.5 h-7 w-7 shrink-0 text-warm-300 transition-transform group-hover:translate-x-1 sm:h-8 sm:w-8" aria-hidden="true" />
                     </h2>
                   </div>
                 </Link>

                 {deeperArticle && (
                   <Link
                     href={articleHref(deeperArticle.slug)}
                     className="group block border-t border-warm-200 bg-white p-5 text-navy transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:border-l sm:border-t-4 sm:p-6"
                   >
                     <div>
                       <p className="text-xs font-bold uppercase tracking-wider text-slate">Go Deeper · Optional</p>
                       <h2 className="mt-2 flex items-start justify-between gap-3 text-xl font-bold leading-tight text-navy">
                         <span>{deeperArticle.title}</span>
                         <ArrowRight className="h-7 w-7 shrink-0 text-brand transition-transform group-hover:translate-x-1" aria-hidden="true" />
                       </h2>
                       <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate">
                         {deeperArticle.excerpt}
                       </p>
                     </div>
                   </Link>
                 )}
               </div>

               <div className="flex flex-col items-center gap-8">
                  <div className="w-full">
                    <ArticleReaction articleSlug={article.slug} compact />
                  </div>

                  <div className="w-full rounded-xl border border-blue-100 bg-blue-50 p-5 text-center text-navy sm:p-6">
                     <div>
                       <h2 className="text-xl font-bold">Questions along the way?</h2>
                       <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate">
                        If something is on your heart or you would like help taking your next step, you’re welcome to send a message.
                      </p>
                       <Button asChild variant="outline" className="mt-4 h-10 rounded-full border-blue-200 bg-white px-5 font-bold text-blue-900 hover:bg-blue-100">
                        <Link href="/message">Send a Message</Link>
                      </Button>
                    </div>
                 </div>

                 <div className="pt-8 w-full text-center">
                   <p className="text-xs leading-relaxed text-slate">
                     Scripture references open an accessible NET Bible preview. {NET_COPYRIGHT}
                   </p>
                 </div>
               </div>
            </div>
          </article>
        </main>
      </div>
    </Layout>
  );
}

export function ArticlePlaceholder() {
  useTrackRecentPage();
  const params = useParams();
  const [location] = useLocation();
  const routeGroup = location.split("?")[0].split("/").filter(Boolean)[0];
  const articleSlug =
    routeGroup === "adv" || routeGroup === "deeper"
      ? `${routeGroup}-${params.slug || ""}`
      : params.slug || "";

  const article = getArticleBySlug(articleSlug);
  if (!article) return <NotFound />;

  const groupArticles = getArticlesInGroup(article.group);
  const articleIndex = groupArticles.findIndex((item) => item.slug === article.slug);
  const previous = groupArticles[articleIndex - 1];
  const next = groupArticles[articleIndex + 1];
  const blocks = article.blocks;
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

  const continuationHref = (href: string) => {
    const internalArticle = href.match(/^\/(adv|deeper)\/([^/?#]+)$/);
    if (internalArticle) {
      return articleHref(`${internalArticle[1]}-${internalArticle[2]}`);
    }
    const journey = currentSearch.get("journey");
    if (!journey) return href;
    const separator = href.includes("?") ? "&" : "?";
    return `${href}${separator}journey=${encodeURIComponent(journey)}&entry=${encodeURIComponent(
      currentSearch.get("entry") || "direct",
    )}&from=faq&step=faq`;
  };

  if (article.group === "adventure") {
    return (
      <AdventureArticleView
        article={article}
        groupArticles={groupArticles}
        articleIndex={articleIndex}
        articleHref={articleHref}
        continuationHref={continuationHref}
      />
    );
  }

  return (
    <Layout>
      <main className="container mx-auto max-w-4xl px-5 py-8 sm:px-8 md:py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" className="-ml-4 text-muted-foreground hover:text-foreground">
            <Link href="/explore-articles">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">
            {articleIndex + 1} of {groupArticles.length}
          </span>
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
                <RichText text={blocks[firstParagraphIndex].text} />
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

          {article.relatedSlug && getArticleBySlug(article.relatedSlug) && (
            <div className="mt-8 rounded-2xl border border-warm-200 bg-warm-50 p-6 sm:p-8">
              <p className="mb-2 text-sm font-bold uppercase tracking-wider text-warm-700">Continue exploring</p>
              <Link
                href={articleHref(article.relatedSlug)}
                className="inline-flex items-center text-xl font-semibold text-navy hover:text-brand"
              >
                {getArticleBySlug(article.relatedSlug)?.title}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          )}

          <div className="mt-10 border-t border-border-soft pt-8">
            <p className="text-xs leading-relaxed text-slate">
              Scripture references open an accessible NET Bible preview. {NET_COPYRIGHT}
            </p>
          </div>

          <div className="mt-10">
            <ArticleReaction articleSlug={article.slug} />
          </div>

          <nav aria-label="Article navigation" className="mt-8 grid gap-3 sm:grid-cols-2">
            {previous ? (
              <Link
                href={articleHref(previous.slug)}
                className="group rounded-xl border border-border-soft bg-white p-5 hover:border-brand/40 hover:shadow-sm transition-all"
              >
                <span className="block text-xs font-bold uppercase tracking-wider text-slate">Previous</span>
                <span className="mt-2 flex items-center font-semibold text-navy group-hover:text-brand">
                  <ArrowLeft className="mr-2 h-4 w-4" /> {previous.title}
                </span>
              </Link>
            ) : <span aria-hidden="true" />}
            {next ? (
              <Link
                href={articleHref(next.slug)}
                className="group rounded-xl border border-border-soft bg-white p-5 text-left hover:border-brand/40 hover:shadow-sm transition-all sm:text-right"
              >
                <span className="block text-xs font-bold uppercase tracking-wider text-slate">Next</span>
                <span className="mt-2 flex items-center justify-end font-semibold text-navy group-hover:text-brand">
                  {next.title} <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
            ) : <span aria-hidden="true" />}
          </nav>

          <div className="mt-10 rounded-2xl border border-blue-200 bg-blue-50 p-7 text-center text-navy sm:p-9 shadow-sm">
            <MessageCircle className="mx-auto mb-4 h-9 w-9 opacity-80 text-brand" />
            <h2 className="text-2xl font-bold">Questions about this article?</h2>
            <p className="mx-auto mt-3 max-w-xl leading-relaxed text-slate">
              If something is on your heart or you would like help taking your next step, you’re welcome to send a message.
            </p>
            <Button asChild variant="warm" className="mt-6 shadow-sm">
              <Link href="/message">Send a Message</Link>
            </Button>
          </div>

          {article.continuation && (
            <div className="mt-8 rounded-2xl border border-warm-200 bg-warm-50 p-6 sm:p-8">
              <p className="mb-2 text-sm font-bold uppercase tracking-wider text-warm-700">
                Your next step
              </p>
              <Link
                href={continuationHref(article.continuation.href)}
                className="inline-flex items-center text-xl font-semibold text-navy hover:text-brand"
              >
                {article.continuation.label}
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          )}
        </article>
      </main>
    </Layout>
  );
}
