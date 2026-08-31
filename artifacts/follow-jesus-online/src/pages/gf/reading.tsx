import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { getGFBook } from "@/data/go-further-library";
import { ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react";
import NotFound from "@/pages/not-found";
import { useTrackRecentPage } from "@/hooks/use-recent-page";
import { Button } from "@/components/ui/button";

export function GFReadingPage() {
  useTrackRecentPage();
  const params = useParams();
  
  const book = getGFBook(params.bookSlug || "");
  if (!book) return <NotFound />;

  const readingIndex = book.readings.findIndex((r) => r.slug === params.readingSlug);
  if (readingIndex === -1) return <NotFound />;

  const reading = book.readings[readingIndex];
  const previous = book.readings[readingIndex - 1];
  const next = book.readings[readingIndex + 1];

  // Clean the title from the leading "1. " or "2. " pattern if it exists, just for display.
  // Actually, keeping the number might be nice for context, but let's just show it as is.

  return (
    <Layout>
      <main className="container mx-auto max-w-3xl px-5 py-10 sm:px-8 md:py-16 flex flex-col min-h-[70vh]">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" className="-ml-4 text-muted-foreground hover:text-foreground">
            <Link href={`/gf/${book.slug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to {book.title}
            </Link>
          </Button>
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Reading {readingIndex + 1} of {book.readings.length}
          </span>
        </div>

        <article className="animate-in fade-in slide-in-from-bottom-6 duration-700 flex-1">
          <header className="mb-12">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-secondary/50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary-foreground">
              <BookOpen className="h-3.5 w-3.5" /> {book.title}
            </div>
            <h1 className="text-3xl font-serif font-bold leading-tight text-foreground md:text-5xl mb-6">
              {reading.title}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary/20 pl-4 italic">
              {reading.desc}
            </p>
          </header>

          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/10 p-8 sm:p-12 text-center my-12">
            <div className="inline-flex w-16 h-16 rounded-full bg-primary/10 text-primary items-center justify-center mb-6">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-foreground mb-3">Content coming soon</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              This reading is currently being prepared for the digital library. 
              The complete text will be available in a future update.
            </p>
          </div>
        </article>

        <nav aria-label="Reading navigation" className="mt-12 pt-8 border-t border-border/60">
          <div className="grid gap-4 sm:grid-cols-2">
            {previous ? (
              <Link
                href={`/gf/${book.slug}/${previous.slug}`}
                className="group rounded-xl border border-border/60 bg-card p-5 hover:border-primary/40 transition-colors"
              >
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Previous</span>
                <span className="mt-2 flex items-center font-semibold text-foreground group-hover:text-primary transition-colors">
                  <ArrowLeft className="mr-2 h-4 w-4 shrink-0" /> <span className="truncate">{previous.title}</span>
                </span>
              </Link>
            ) : <span aria-hidden="true" />}
            
            {next ? (
              <Link
                href={`/gf/${book.slug}/${next.slug}`}
                className="group rounded-xl border border-border/60 bg-card p-5 text-left hover:border-primary/40 transition-colors sm:text-right flex flex-col items-start sm:items-end"
              >
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Next reading</span>
                <span className="mt-2 flex items-center justify-end font-semibold text-foreground group-hover:text-primary transition-colors w-full">
                  <span className="truncate">{next.title}</span> <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                </span>
              </Link>
            ) : (
              <Link
                href={`/gf/${book.slug}`}
                className="group rounded-xl border border-border/60 bg-card p-5 text-left hover:border-primary/40 transition-colors sm:text-right flex flex-col items-start sm:items-end"
              >
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Finished</span>
                <span className="mt-2 flex items-center justify-end font-semibold text-foreground group-hover:text-primary transition-colors w-full">
                  Back to the reading list <BookOpen className="ml-2 h-4 w-4 shrink-0" />
                </span>
              </Link>
            )}
          </div>
          
          {next && (
            <div className="mt-8 text-center sm:hidden">
              <Link 
                href={`/gf/${book.slug}`}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4"
              >
                Back to the reading list
              </Link>
            </div>
          )}
          {next && (
             <div className="mt-8 text-center hidden sm:block">
               <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
                 <Link href={`/gf/${book.slug}`}>Back to the reading list</Link>
               </Button>
             </div>
          )}
        </nav>
      </main>
    </Layout>
  );
}
