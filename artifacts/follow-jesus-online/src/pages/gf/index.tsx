import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { GO_FURTHER_BOOKS } from "@/data/go-further-library";
import { ArrowRight } from "lucide-react";

export function GoFurtherPage() {
  return (
    <Layout>
      <div className="min-h-[100dvh] bg-[#F7F1E6] pb-20">
        <main className="container mx-auto max-w-3xl px-5 py-12 sm:px-8 md:py-16">
          <header className="mb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-warm-300 sm:w-24" />
              <span className="text-xs font-bold uppercase tracking-[0.15em] text-warm-700 sm:text-sm">Five books · Your next steps</span>
              <div className="h-px w-12 bg-warm-300 sm:w-24" />
            </div>
            <h1 className="mb-7 font-serif text-4xl font-bold uppercase leading-[1.15] tracking-tight text-navy sm:text-5xl md:text-[3.5rem]">
              Go Further
            </h1>
            <div className="mx-auto max-w-2xl space-y-5 text-lg leading-relaxed text-slate sm:text-[19px]">
              <p>The short guide showed you the path. These books walk it with you for a longer stretch.</p>
              <p>Each one takes a single part of your new life and gives it room—your heart, your identity, the greatness of God, the Spirit’s presence, and the habits of growing up in Christ.</p>
              <p>You do not have to read them in order. Begin with the title that meets you today.</p>
            </div>
          </header>

          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {GO_FURTHER_BOOKS.map((book, index) => (
              <Link
                key={book.slug}
                href={`/gf/${book.slug}`}
                className="group flex overflow-hidden rounded-xl border border-warm-300 bg-warm-50/80 shadow-sm transition-all hover:-translate-y-0.5 hover:border-warm-500 hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <span className="w-2 shrink-0 border-r border-warm-500 bg-blue-900 sm:w-3" aria-hidden="true" />
                <div className="min-w-0 flex-1 px-5 py-6 sm:px-8 sm:py-8">
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-warm-700">
                    Book {index + 1} of {GO_FURTHER_BOOKS.length}
                  </span>
                  <h2 className="mt-2 font-sans text-2xl font-bold uppercase leading-tight text-navy transition-colors group-hover:text-brand sm:text-3xl">
                    {book.title}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate">{book.subtitle}</p>
                  <p className="mt-4 max-w-2xl leading-relaxed text-slate">{book.desc}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand">
                    Open this book <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </Layout>
  );
}
