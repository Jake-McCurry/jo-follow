import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { getGFBook } from "@/data/go-further-library";
import { ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";

export function GFReadingPage() {
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
      <main className="container mx-auto flex min-h-[70vh] max-w-3xl flex-col px-5 py-8 sm:px-8 md:py-10">
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

        <article className="animate-in fade-in slide-in-from-bottom-6 duration-700 flex-1">
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

          <div className="rounded-2xl border border-dashed border-border-soft bg-white p-8 sm:p-12 text-center my-12 shadow-sm">
            <div className="inline-flex w-16 h-16 rounded-full bg-warm-100 text-warm-700 items-center justify-center mb-6">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-navy mb-3">Content coming soon</h2>
            <p className="text-slate max-w-md mx-auto">
              This reading is currently being prepared for the digital library. 
              The complete text will be available in a future update.
            </p>
          </div>
        </article>

        <nav aria-label="Reading navigation" className="mt-12 pt-8 border-t border-border-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            {previous ? (
              <Link
                href={`/gf/${book.slug}/${previous.slug}`}
                className="group rounded-xl border border-border-soft bg-white p-5 hover:border-brand/40 transition-colors shadow-sm"
              >
                <span className="block text-xs font-bold uppercase tracking-wider text-slate">Previous</span>
                <span className="mt-2 flex items-center font-bold text-navy group-hover:text-brand transition-colors">
                  <ArrowLeft className="mr-2 h-4 w-4 shrink-0" /> <span className="truncate">{previous.title}</span>
                </span>
              </Link>
            ) : <span aria-hidden="true" />}
            
            {next ? (
              <Link
                href={`/gf/${book.slug}/${next.slug}`}
                className="group rounded-xl border border-border-soft bg-white p-5 text-left hover:border-brand/40 transition-colors sm:text-right flex flex-col items-start sm:items-end shadow-sm"
              >
                <span className="block text-xs font-bold uppercase tracking-wider text-slate">Next reading</span>
                <span className="mt-2 flex items-center justify-end font-bold text-navy group-hover:text-brand transition-colors w-full">
                  <span className="truncate">{next.title}</span> <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                </span>
              </Link>
            ) : (
              <Link
                href={`/gf/${book.slug}`}
                className="group rounded-xl border border-border-soft bg-white p-5 text-left hover:border-brand/40 transition-colors sm:text-right flex flex-col items-start sm:items-end shadow-sm"
              >
                <span className="block text-xs font-bold uppercase tracking-wider text-slate">Finished</span>
                <span className="mt-2 flex items-center justify-end font-bold text-navy group-hover:text-brand transition-colors w-full">
                  Back to the reading list <BookOpen className="ml-2 h-4 w-4 shrink-0" />
                </span>
              </Link>
            )}
          </div>
          
          {next && (
            <div className="mt-8 text-center sm:hidden">
              <Link 
                href={`/gf/${book.slug}`}
                className="text-sm font-bold text-slate hover:text-navy underline underline-offset-4"
              >
                Back to the reading list
              </Link>
            </div>
          )}
          {next && (
             <div className="mt-8 text-center hidden sm:block">
               <Button asChild variant="ghost" className="text-slate hover:text-navy hover:bg-warm-50">
                 <Link href={`/gf/${book.slug}`}>Back to the reading list</Link>
               </Button>
             </div>
          )}
        </nav>
      </main>
    </Layout>
  );
}
