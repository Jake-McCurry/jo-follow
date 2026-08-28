import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
import { ScriptureRef } from "@/components/scripture-ref";
import { ShareButton } from "@/components/share-button";
import { useTrackRecentPage } from "@/hooks/use-recent-page";
import NotFound from "@/pages/not-found";
import { findArticle, type ArticleRecord } from "@/content/articles";

const SCRIPTURE_REFERENCE =
  /\b(?:[1-3]\s+)?(?:Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|1 Samuel|2 Samuel|1 Kings|2 Kings|1 Chronicles|2 Chronicles|Ezra|Nehemiah|Esther|Job|Psalms?|Proverbs|Ecclesiastes|Song of Solomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Daniel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|1 Corinthians|2 Corinthians|Galatians|Ephesians|Philippians|Colossians|1 Thessalonians|2 Thessalonians|1 Timothy|2 Timothy|Titus|Philemon|Hebrews|James|1 Peter|2 Peter|1 John|2 John|3 John|Jude|Revelation)\s+\d+(?::\d+(?:[-–]\d+)?)?(?:\s*[-–]\s*\d+)?/g;

function ArticleText({ text }: { text: string }) {
  const pieces: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(SCRIPTURE_REFERENCE)) {
    const reference = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) pieces.push(text.slice(lastIndex, index));
    pieces.push(<ScriptureRef key={`${reference}-${index}`} reference={reference} />);
    lastIndex = index + reference.length;
  }

  if (lastIndex < text.length) pieces.push(text.slice(lastIndex));
  return pieces;
}

function PublishedArticle({ article }: { article: ArticleRecord }) {
  const normalizedTitle = (value: string) =>
    value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
  const blocks =
    article.blocks[0] &&
    article.blocks[0].kind === "heading" &&
    normalizedTitle(article.blocks[0].text) === normalizedTitle(article.title)
      ? article.blocks.slice(1)
      : article.blocks;

  return (
    <Layout>
      <div className="container mx-auto px-5 sm:px-8 py-12 md:py-20 max-w-3xl">
        <div className="mb-10 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground -ml-4">
            <Link href="/explore-articles">
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" /> Back to Articles
            </Link>
          </Button>
          <ShareButton
            title={article.title}
            text={`Read "${article.title}" on Follow Jesus Online.`}
            label="Share"
            className="shrink-0"
          />
        </div>

        <article className="bg-card border border-border/60 rounded-2xl p-7 sm:p-10 md:p-12 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider rounded-full mb-6">
            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> {article.category}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-10 leading-tight">
            {article.title}
          </h1>

          <div className="border-t border-border pt-8 space-y-5 text-card-foreground/90 leading-relaxed">
            {blocks.map((block, index) =>
              block.kind === "heading" ? (
                <h2 key={`${block.text}-${index}`} className="text-2xl md:text-3xl font-bold text-foreground pt-5 first:pt-0">
                  {block.text}
                </h2>
              ) : (
                <p key={`${block.text.slice(0, 30)}-${index}`} className="text-lg">
                  <ArticleText text={block.text} />
                </p>
              ),
            )}
          </div>

          <div className="mt-10 pt-7 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Keep exploring resources for walking with Jesus.</span>
            <Button asChild variant="outline">
              <Link href="/explore-articles">Explore More Articles</Link>
            </Button>
          </div>
        </article>
      </div>
    </Layout>
  );
}

export function ArticlePlaceholder() {
  useTrackRecentPage();
  const params = useParams();
  const [location] = useLocation();

  const routeSlug = params.slug || "";
  const articlePrefix = ["adv-", "deeper-", "more-"].find((prefix) =>
    routeSlug.startsWith(prefix)
  );

  if (!articlePrefix) return <NotFound />;
  const publishedArticle = findArticle(`/${routeSlug}`);
  if (publishedArticle) return <PublishedArticle article={publishedArticle} />;

  // Create a readable title from the slug
  const title = routeSlug
    .slice(articlePrefix.length)
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const typeLabel = location.startsWith("/deeper") 
    ? "Deep Dive" 
    : location.startsWith("/more") 
      ? "Resource" 
      : "Guide Chapter";

  return (
    <Layout>
      <div className="container mx-auto px-5 sm:px-8 py-12 md:py-20 max-w-3xl">
        <div className="mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground -ml-4">
            <Link href="/explore-articles">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
            </Link>
          </Button>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-8 md:p-12 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider rounded-full mb-6">
            <BookOpen className="w-3.5 h-3.5" /> {typeLabel}
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8 leading-tight">
            {title}
          </h1>
          
          <div className="flex flex-col items-center justify-center py-16 text-center border-t border-border mt-8">
            <Clock className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-2xl font-semibold mb-2">Content Coming Soon</h2>
            <p className="text-muted-foreground max-w-md">
              We are currently preparing this material for you. Please check back later.
            </p>
            <p className="text-sm text-muted-foreground mt-8">
              In the meantime, you can try reading <ScriptureRef reference="John 3:16" /> or <ScriptureRef reference="Romans 8:38-39" />.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
