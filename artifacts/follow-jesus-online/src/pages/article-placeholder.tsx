import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useParams } from "wouter";
import { ArrowLeft, ArrowRight, BookOpen, HelpCircle, MessageCircle } from "lucide-react";
import { ScriptureRef } from "@/components/scripture-ref";
import { useTrackRecentPage } from "@/hooks/use-recent-page";
import NotFound from "@/pages/not-found";
import { ShareButton } from "@/components/share-button";
import {
  getArticleBySlug,
  getArticlePath,
  getArticlesInGroup,
  type ArticleBlock,
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
    .map((book) => book.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
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

function ArticleBlockView({ block }: { block: ArticleBlock }) {
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
  const isLead = articleIndex === 0;
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
                          <ArticleBlockView key={itemIndex} block={item} />
                        ))}
                      </ul>
                    );
                  }
                  return <ArticleBlockView key={index} block={block} />;
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
