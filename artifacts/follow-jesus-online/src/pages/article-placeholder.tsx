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
import { splitScriptureText } from "@/lib/scripture-text";

const WEB_ADDRESS_PATTERN =
  /(https?:\/\/[^\s]+|(?:follow\.jesusonline\.com|bible\.com|equip\.jesusonline\.com|app\.jesusonline\.com)(?:\/[^\s]*)?)/g;

function BibleText({ text }: { text: string }) {
  return (
    <>
      {splitScriptureText(text).map((part, index) => part.reference ? (
        <span key={index} className="whitespace-nowrap">
          {part.prefix}
          <ScriptureRef reference={part.reference}>{part.text}</ScriptureRef>
          {part.suffix}
        </span>
      ) : <span key={index}>{part.text}</span>)}
    </>
  );
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

function EmphasizedRichText({ text, phrases = [] }: { text: string; phrases?: string[] }) {
  const ranges: { start: number; end: number }[] = [];
  for (const phrase of phrases) {
    if (!phrase) continue;
    let start = text.indexOf(phrase);
    while (start >= 0) {
      ranges.push({ start, end: start + phrase.length });
      start = text.indexOf(phrase, start + phrase.length);
    }
  }
  ranges.sort((a, b) => a.start - b.start || b.end - a.end);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    if (range.start > cursor) parts.push(<RichText key={`text-${cursor}`} text={text.slice(cursor, range.start)} />);
    parts.push(<strong key={`bold-${range.start}`}><RichText text={text.slice(range.start, range.end)} /></strong>);
    cursor = range.end;
  }
  parts.push(<RichText key="tail" text={text.slice(cursor)} />);
  return <>{parts}</>;
}

function LinkedRichText({ block }: { block: ArticleBlock }) {
  if (!block.links?.length) {
    const content = <EmphasizedRichText text={block.text} phrases={block.boldPhrases} />;
    return block.bold ? <strong>{content}</strong> : content;
  }
  const result: React.ReactNode[] = [];
  let cursor = 0;
  for (const [index, link] of block.links.entries()) {
    const start = block.text.indexOf(link.label, cursor);
    if (start === -1) continue;
    result.push(<EmphasizedRichText key={`text-${index}`} text={block.text.slice(cursor, start)} phrases={block.boldPhrases} />);
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
  result.push(<EmphasizedRichText key="remaining" text={block.text.slice(cursor)} phrases={block.boldPhrases} />);
  return block.bold ? <strong>{result}</strong> : <>{result}</>;
}

export function DefaultArticleBlockView({ block }: { block: ArticleBlock }) {
  if (block.type === "answer-line") {
    return <div aria-hidden="true" className="h-6 w-full border-b border-navy/30" />;
  }
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
    if (block.headingLevel === 3) {
      return (
        <h3 className="text-lg md:text-xl font-bold text-navy mt-8 mb-3 first:mt-0">
          <LinkedRichText block={block} />
        </h3>
      );
    }
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
             <LinkedRichText block={{ ...block, text: block.text.replace(/^Q:\s*/, "") }} />
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
  if (group === "prayer") return "Prayer Starters";
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
  if (block.type === "image" || block.type === "answer-line") return <DefaultArticleBlockView block={block} />;
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
           <LinkedRichText block={{ ...block, text: block.text.replace(/^(?:Q:|Your thoughts:)\s*/i, "") }} />
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

  const isQuote = block.presentation === "story" || block.text.startsWith("“") || block.text.startsWith("\"");
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

export function AdventureArticleBlocks({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="prose prose-lg max-w-none prose-p:font-sans prose-headings:font-sans">
      <div className="space-y-6">
        {blocks.map((block, index) => {
          if (block.type === "answer-line") {
            if (blocks[index - 1]?.type === "answer-line") return null;
            const lines: ArticleBlock[] = [];
            for (let position = index; blocks[position]?.type === "answer-line"; position += 1) {
              lines.push(blocks[position]);
            }
            return (
              <div key={index} className="not-prose w-full space-y-3" aria-hidden="true">
                {lines.map((line, lineIndex) => <AdventureBlockView key={lineIndex} block={line} />)}
              </div>
            );
          }
          if (block.type === "list") {
            if (blocks[index - 1]?.type === "list") return null;
            const items: ArticleBlock[] = [];
            for (let position = index; blocks[position]?.type === "list"; position += 1) {
              items.push(blocks[position]);
            }
            return (
              <ul key={index} className="my-8 list-none space-y-3 pl-0">
                {items.map((item, itemIndex) => (
                  <AdventureBlockView key={itemIndex} block={item} />
                ))}
              </ul>
            );
          }
          return <AdventureBlockView key={index} block={block} />;
        })}
      </div>
    </div>
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

            <AdventureArticleBlocks blocks={blocks} />

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
    routeGroup === "prayer" && !params.slug ? "prayer-starter-guide" :
    routeGroup === "adv" || routeGroup === "deeper" || routeGroup === "prayer"
      ? `${routeGroup}-${params.slug || ""}`
      : params.slug || "";

  const article = getArticleBySlug(articleSlug);
  if (!article) return <NotFound />;

  const groupArticles = getArticlesInGroup(article.group);
  const articleIndex = groupArticles.findIndex((item) => item.slug === article.slug);
  const nextPrayerArticle = article.group === "prayer" ? groupArticles[articleIndex + 1] : undefined;
  const guideArticles = article.group === "deeper" ? getArticlesInGroup("adventure") : [];
  const mainGuideArticle = guideArticles.find((item) => item.relatedSlug === article.slug);
  const mainGuideIndex = mainGuideArticle
    ? guideArticles.findIndex((item) => item.slug === mainGuideArticle.slug)
    : -1;
  const nextGuideArticle = mainGuideIndex >= 0 ? guideArticles[mainGuideIndex + 1] : undefined;
  const blocks = article.blocks;
  const isJourneyFaq = article.group === "received" || article.group === "rededicated";
  const introInContentBox = isJourneyFaq || article.group === "believer" ||
    (article.group === "prayer" && articleIndex === 0);
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
             <Link href={article.group === "prayer" ? articleIndex === 0 ? "/#connect-with-god" : "/prayer" : linkedSource ? getArticlePath(linkedSource.faqSlug) : "/explore-articles"}>
               <ArrowLeft className="w-4 h-4 mr-2" /> {article.group === "prayer" ? articleIndex === 0 ? "Back to Connect with God" : "Back to Prayer Starters" : linkedSource ? "Back to question" : "Back to Articles"}
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
             {!introInContentBox && firstParagraphIndex >= 0 && (
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
                   if (!introInContentBox && index === firstParagraphIndex) return null;
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
            } : nextPrayerArticle ? {
              href: articleHref(nextPrayerArticle.slug),
              title: nextPrayerArticle.title,
              label: "Read the next prayer article",
            } : undefined}
            secondary={mainGuideArticle ? {
              href: articleHref(mainGuideArticle.slug),
              title: mainGuideArticle.title,
              label: "Back to the chapter",
              back: true,
            } : article.group === "prayer" && articleIndex > 0 ? {
              href: "/prayer",
              title: "Prayer Starter Guide",
              label: "Explore the prayer guide",
              back: true,
            } : isJourneyFaq ? {
              href: articleHref("adv-begin-the-adventure"),
              title: "Begin the Adventure",
              label: "The Adventure of Living with Jesus",
            } : undefined}
          />
        </article>
      </main>
    </Layout>
  );
}
