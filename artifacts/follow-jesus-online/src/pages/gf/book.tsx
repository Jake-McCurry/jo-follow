import { Layout } from "@/components/layout";
import { Link, useParams } from "wouter";
import { getGFBook, GO_FURTHER_BOOKS } from "@/data/go-further-library";
import { ArrowRight } from "lucide-react";
import NotFound from "@/pages/not-found";
import { ShareButton } from "@/components/share-button";

export function GFBookPage() {
  const params = useParams();
  const book = getGFBook(params.slug || "");
  if (!book) return <NotFound />;
  const bookNumber = GO_FURTHER_BOOKS.findIndex((item) => item.slug === book.slug) + 1;
  const startHref = book.introChapter
    ? `/gf/${book.slug}/${book.introChapter.slug}`
    : `/gf/${book.slug}/${book.readings[0].slug}`;
  const startTitle = book.introChapter?.title ?? book.readings[0].title;

  return (
    <Layout>
      <div className="min-h-[100dvh] bg-[#F7F1E6] pb-20">
        <main className="container mx-auto max-w-3xl px-5 py-8 sm:px-8 md:py-10">
          <nav aria-label="Breadcrumb" className="mb-10 text-sm text-slate">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li><Link href="/gf" className="font-medium text-navy hover:text-brand hover:underline">Go Further</Link></li>
              <li aria-hidden="true" className="text-slate/40">/</li>
              <li aria-current="page">{book.title}</li>
            </ol>
          </nav>

          <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-12 text-center">
              <div className="mb-6 flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-warm-300 sm:w-24" />
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-warm-700 sm:text-sm">
                  Book {bookNumber} of {GO_FURTHER_BOOKS.length}
                </span>
                <div className="h-px w-12 bg-warm-300 sm:w-24" />
              </div>
              <h1 className="mb-5 font-serif text-4xl font-bold uppercase leading-[1.15] tracking-tight text-navy sm:text-5xl md:text-[3.5rem]">
                {book.title}
              </h1>
              <p className="mb-6 text-lg leading-relaxed text-slate">{book.subtitle}</p>
              <ShareButton
                title={`${book.title} | Follow Jesus Online`}
                text={`Read “${book.title}” from Follow Jesus Online.`}
                label="Share this book"
                variant="ghost"
                className="h-8 rounded-full px-3 text-xs font-medium text-slate hover:bg-warm-50 hover:text-navy"
              />
            </header>

            <div className="space-y-6 text-lg leading-relaxed text-slate sm:text-[19px]">
              {book.intro.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>

            <Link
              href={startHref}
              className="group mt-10 block rounded-xl border border-blue-900 border-t-4 border-t-warm-500 bg-blue-900 p-5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-950 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:p-7"
            >
              <span className="block text-xs font-bold uppercase tracking-wide text-blue-100 sm:text-sm">{book.buttonText}</span>
              <span className="mt-2 flex items-start justify-between gap-3 font-serif text-xl font-bold leading-tight text-white sm:text-3xl">
                <span>{startTitle}</span>
                <ArrowRight className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1 sm:h-8 sm:w-8" aria-hidden="true" />
              </span>
            </Link>

            <nav aria-label={`Contents of ${book.title}`} className="mt-16">
              <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-navy sm:text-3xl">
                <span className="hidden h-px w-12 bg-warm-300 sm:block" aria-hidden="true" />
                Contents
              </h2>
              <ol className="border-t border-warm-300">
                {book.introChapter && (
                  <li className="border-b border-warm-300">
                    <Link
                      href={`/gf/${book.slug}/${book.introChapter.slug}`}
                      className="group block py-5 transition-colors hover:bg-warm-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:px-4"
                    >
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-warm-700">Introduction</span>
                      <h3 className="mt-1 text-xl font-bold text-navy group-hover:text-brand">{book.introChapter.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate sm:text-base">{book.introChapter.desc}</p>
                    </Link>
                  </li>
                )}
                {book.readings.map((reading, index) => (
                  <li key={reading.slug} className="border-b border-warm-300">
                    <Link
                      href={`/gf/${book.slug}/${reading.slug}`}
                      className="group block py-5 transition-colors hover:bg-warm-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:px-4"
                    >
                      <span className="text-xs font-bold uppercase tracking-[0.12em] text-warm-700">Chapter {index + 1}</span>
                      <h3 className="mt-1 text-xl font-bold text-navy group-hover:text-brand">
                        {reading.title.replace(/^\d+\.\s*/, "")}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate sm:text-base">{reading.desc}</p>
                      {book.tocLinkStyle === "title-and-more" && (
                        <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                          Read more <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-16 rounded-xl bg-warm-50/70 p-6 text-center sm:p-8">
              <p className="text-lg italic leading-relaxed text-navy">“{book.closing}”</p>
              <Link href={startHref} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                {book.buttonText} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </main>
      </div>
    </Layout>
  );
}
