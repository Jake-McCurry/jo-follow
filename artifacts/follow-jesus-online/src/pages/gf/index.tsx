import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { GO_FURTHER_BOOKS } from "@/data/go-further-library";
import { ArrowRight, BookOpen } from "lucide-react";
import { useTrackRecentPage } from "@/hooks/use-recent-page";

export function GoFurtherPage() {
  useTrackRecentPage();

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-5 py-8 sm:px-8 md:py-10">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-brand/80">Go Further</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-navy mb-8 text-balance">
            The short guide showed you the path. These books walk it with you for a longer stretch.
          </h1>
          <div className="w-12 h-1 bg-warm-accent mx-auto rounded-full mb-8"></div>
          <div className="space-y-4 text-lg text-slate max-w-2xl mx-auto leading-relaxed">
            <p>
              Each one takes a single part of your new life and gives it room—your heart, your identity, the greatness of God, the Spirit’s presence, and the habits of growing up in Christ.
            </p>
            <p>
              You do not have to read them in order. Begin with the title that meets you today.
            </p>
          </div>
        </div>

        <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
          {GO_FURTHER_BOOKS.map((book, i) => (
            <Link 
              key={book.slug} 
              href={`/gf/${book.slug}`}
              className="group flex flex-col md:flex-row gap-6 md:gap-8 rounded-2xl bg-white p-6 sm:p-8 md:p-10 border border-border-soft shadow-sm transition-all hover:border-brand/30 hover:shadow-md hover:bg-blue-50/50 items-start"
            >
              <div className="hidden md:flex shrink-0 w-16 h-20 bg-blue-50 rounded-md border border-border-soft items-center justify-center text-brand/60 group-hover:bg-blue-100 group-hover:text-brand transition-colors">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex flex-col mb-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-navy group-hover:text-brand transition-colors">
                    {book.title}
                  </h2>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate mt-1">
                    {book.subtitle}
                  </p>
                </div>
                <p className="text-slate leading-relaxed mb-6 max-w-2xl">
                  {book.desc}
                </p>
                <div className="flex items-center text-brand font-bold text-sm">
                  Open this book <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
