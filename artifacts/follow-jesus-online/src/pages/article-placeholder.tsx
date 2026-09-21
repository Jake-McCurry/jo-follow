import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, ArrowRight, BookOpen, HelpCircle, MessageCircle, Compass, Map, Quote } from "lucide-react";
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
      <h2 className="font-serif text-2xl md:text-3xl font-bold text-navy mt-12 mb-4 first:mt-0">
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
      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy mt-14 mb-6 text-center sm:text-left flex flex-col sm:flex-row items-center gap-3">
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
      <div className="my-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full border border-warm-400 flex items-center justify-center text-warm-600 bg-white shadow-sm sm:mt-2">
           <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 stroke-1" />
        </div>
        <div className="rounded-xl bg-warm-50 p-6 sm:p-8 text-navy flex-1 border border-warm-100/50 shadow-sm w-full">
          <p className="font-serif text-xl sm:text-2xl leading-relaxed text-navy">
            <RichText text={block.text.replace(/^Q:\s*/, "")} />
          </p>
        </div>
      </div>
    );
  }

  if (block.type === "table-row") {
    return (
      <div className="my-8 border-l-4 border-warm-500 bg-warm-50/40 px-6 py-5 rounded-r-xl">
        <p className="font-serif text-lg italic text-navy leading-relaxed">
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
          <p className="font-serif text-xl sm:text-2xl leading-relaxed text-navy italic">
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
  firstParagraphIndex,
  articleHref,
  continuationHref,
}: {
  article: Article;
  groupArticles: Article[];
  articleIndex: number;
  firstParagraphIndex: number;
  articleHref: (slug: string) => string;
  continuationHref: (href: string) => string;
}) {
  const previous = groupArticles[articleIndex - 1];
  const next = groupArticles[articleIndex + 1];
  const blocks = article.blocks;

  return (
    <Layout>
      <div className="bg-paper min-h-[100dvh] pb-20">
        <div className="bg-blue-800 text-white flex items-center justify-between px-4 sm:px-8 py-3 text-sm font-medium tracking-wide shadow-sm">
          <Link href="/explore-articles" className="flex items-center hover:text-blue-200 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Follow</span>
          </Link>

          <div className="flex items-center">
            <Compass className="w-4 h-4 mr-2 text-blue-300 hidden sm:block" />
            <span className="hidden sm:inline">Adventure</span>
            <span className="hidden sm:inline mx-3 text-blue-400">|</span>
            <span className="text-blue-50 font-bold tracking-widest uppercase text-xs">Chapter {articleIndex + 1}</span>
          </div>

          {next ? (
            <Link href={articleHref(next.slug)} className="flex items-center hover:text-blue-200 transition-colors">
              <span className="hidden sm:inline">Next</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          ) : (
            <div className="w-16" />
          )}
        </div>

        <main className="container mx-auto max-w-3xl px-5 py-8 sm:px-8 md:py-10">
          <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-16">
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
              {firstParagraphIndex >= 0 && (
                <p className="text-xl sm:text-2xl text-navy leading-relaxed max-w-2xl mx-auto font-serif">
                  <RichText text={blocks[firstParagraphIndex].text} />
                </p>
              )}
            </div>

            <div className="prose prose-lg max-w-none prose-p:font-sans prose-headings:font-serif">
              <div className="space-y-6">
                {blocks.map((block, index) => {
                  if (index === firstParagraphIndex) return null;
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

            <div className="mt-20 pt-12 border-t border-border-soft">
               <div className="bg-warm-50/50 border border-warm-200 rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-8 mb-16 relative overflow-hidden shadow-sm">
                 <div className="absolute -right-10 -top-10 w-40 h-40 bg-warm-200/30 rounded-full blur-2xl pointer-events-none"></div>

                 <div className="flex items-center gap-6 z-10 w-full sm:w-auto">
                   <div className="w-16 h-16 rounded-full border border-warm-300 flex items-center justify-center bg-white text-warm-600 shadow-sm shrink-0">
                     <Map className="w-7 h-7" />
                   </div>
                   <div>
                     <h3 className="font-serif font-bold text-navy text-2xl mb-1">Continue the path</h3>
                     <p className="text-slate text-sm sm:text-base font-medium">
                       {next ? `Chapter ${articleIndex + 2}: ${next.title}` : "You've finished the guide!"}
                     </p>
                   </div>
                 </div>

                 <div className="z-10 w-full sm:w-auto flex justify-end">
                   {next ? (
                     <Button asChild variant="default" className="rounded-full px-8 py-6 text-base font-semibold shadow-md bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                       <Link href={articleHref(next.slug)}>
                         Next <ArrowRight className="ml-2 w-5 h-5" />
                       </Link>
                     </Button>
                   ) : article.continuation ? (
                     <Button asChild variant="warm" className="rounded-full px-8 py-6 text-base font-semibold shadow-md w-full sm:w-auto">
                       <Link href={continuationHref(article.continuation.href)}>
                         {article.continuation.label} <ArrowRight className="ml-2 w-5 h-5" />
                       </Link>
                     </Button>
                   ) : null}
                 </div>
               </div>

               <div className="flex flex-col items-center gap-12">
                 <ShareButton
                   title={`${article.title} | Follow Jesus Online`}
                   text={`Read “${article.title}” from Follow Jesus Online.`}
                   label="Share this chapter"
                 />

                 <div className="w-full max-w-xl">
                   <ArticleReaction articleSlug={article.slug} />
                 </div>

                 <div className="rounded-3xl border border-blue-100 bg-blue-50 p-8 sm:p-10 text-center text-navy shadow-sm w-full max-w-2xl relative overflow-hidden">
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-200/30 rounded-full blur-2xl pointer-events-none"></div>
                    <div className="relative z-10">
                      <MessageCircle className="mx-auto mb-5 h-10 w-10 text-blue-500" />
                      <h2 className="text-2xl font-bold font-serif mb-3">Questions along the way?</h2>
                      <p className="mx-auto max-w-xl leading-relaxed text-slate text-base">
                        If something is on your heart or you would like help taking your next step, you’re welcome to send a message.
                      </p>
                      <Button asChild variant="outline" className="mt-8 border-blue-200 hover:bg-blue-100 text-blue-900 rounded-full px-8 bg-white/50">
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
        firstParagraphIndex={firstParagraphIndex}
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
