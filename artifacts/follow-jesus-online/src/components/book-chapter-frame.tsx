import type { ReactNode } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { ShareButton } from "@/components/share-button";

type BookChapterFrameProps = {
  bookTitle: string;
  bookHref: string;
  chapterLabel: string;
  title: string;
  children: ReactNode;
};

export function BookChapterFrame({
  bookTitle,
  bookHref,
  chapterLabel,
  title,
  children,
}: BookChapterFrameProps) {
  return (
    <Layout>
      <div className="min-h-[100dvh] bg-[#F7F1E6] pb-20">
        <main className="container mx-auto max-w-3xl px-5 py-8 sm:px-8 md:py-10">
          <nav aria-label="Breadcrumb" className="mb-10 text-sm text-slate">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link href="/gf" className="font-medium text-navy hover:text-brand hover:underline">
                  Go Further
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate/40">/</li>
              <li>
                <Link href={bookHref} className="font-medium text-navy hover:text-brand hover:underline">
                  {bookTitle}
                </Link>
              </li>
              <li aria-hidden="true" className="text-slate/40">/</li>
              <li aria-current="page">{chapterLabel}</li>
            </ol>
          </nav>

          <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="mb-12 text-center">
              <div className="mb-6 flex items-center justify-center gap-4">
                <div className="h-px w-12 bg-warm-300 sm:w-24" />
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-warm-700 sm:text-sm">
                  {chapterLabel}
                </span>
                <div className="h-px w-12 bg-warm-300 sm:w-24" />
              </div>
              <h1 className="mb-8 font-serif text-4xl font-bold uppercase leading-[1.15] tracking-tight text-navy sm:text-5xl md:text-[3.5rem]">
                {title}
              </h1>
              <ShareButton
                title={`${title} | Follow Jesus Online`}
                text={`Read “${title}” from ${bookTitle} on Follow Jesus Online.`}
                label="Share this reading"
                variant="ghost"
                className="h-8 rounded-full px-3 text-xs font-medium text-slate hover:bg-warm-50 hover:text-navy"
              />
            </header>
            {children}
          </article>
        </main>
      </div>
    </Layout>
  );
}