import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { getGFBook } from "@/data/go-further-library";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/share-button";

export function GFBookPage() {
  const params = useParams();
  
  const book = getGFBook(params.slug || "");
  if (!book) return <NotFound />;

  return (
    <Layout>
      <main className="container mx-auto max-w-4xl px-5 py-8 sm:px-8 md:py-10">
        <div className="mb-8">
          <Button asChild variant="ghost" className="-ml-4 text-slate hover:text-navy hover:bg-warm-50">
            <Link href="/gf/">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
            </Link>
          </Button>
        </div>

        <article className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          <header className="mb-12 text-center md:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-navy">
              <BookOpen className="h-3.5 w-3.5" /> Go Further
            </div>
            <h1 className="text-4xl font-serif font-bold leading-tight text-navy md:text-5xl lg:text-6xl mb-4 text-balance">
              {book.title}
            </h1>
            <p className="text-xl italic text-slate mb-8">
              {book.subtitle}
            </p>
            
            <div className="prose prose-lg max-w-none text-slate leading-relaxed text-left">
              {book.intro.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 justify-center md:justify-start">
              <Button asChild size="lg" className="shadow-sm font-bold bg-hero hover:bg-structure text-white">
                <Link href={`/gf/${book.slug}/${book.readings[0].slug}`}>
                  {book.buttonText} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <ShareButton
                title={`${book.title} | Follow Jesus Online`}
                text={`Read “${book.title}” from Follow Jesus Online.`}
                label="Share this book"
                variant="outline"
              />
            </div>
          </header>

          <div className="mt-16">
            <h2 className="text-2xl font-bold text-navy mb-6">
              The {book.readings.length} Readings
            </h2>
            <div className="space-y-4">
              {book.readings.map((reading) => (
                <Link
                  key={reading.slug}
                  href={`/gf/${book.slug}/${reading.slug}`}
                  className="group block rounded-xl border border-border-soft bg-white p-5 sm:p-6 transition-all hover:border-brand/40 hover:bg-surface-soft hover:shadow-sm"
                >
                  <h3 className="text-xl font-bold text-navy group-hover:text-brand mb-2 transition-colors">
                    {reading.title}
                  </h3>
                  <p className="text-slate leading-relaxed text-sm sm:text-base">
                    {reading.desc}
                  </p>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="mt-16 rounded-2xl bg-surface-soft p-8 sm:p-10 text-center text-navy border border-border-soft shadow-sm">
            <p className="text-lg italic max-w-2xl mx-auto mb-8 text-slate">
              "{book.closing}"
            </p>
            <Button asChild className="shadow-sm bg-hero hover:bg-structure text-white">
              <Link href={`/gf/${book.slug}/${book.readings[0].slug}`}>
                {book.buttonText}
              </Link>
            </Button>
          </div>
        </article>
      </main>
    </Layout>
  );
}
