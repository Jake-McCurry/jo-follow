import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { ArticleReaction } from "@/components/article-reaction";
import { Button } from "@/components/ui/button";

const NET_COPYRIGHT =
  "Scripture quoted by permission. Quotations designated (NET) are from the NET Bible® copyright ©1996, 2019 by Biblical Studies Press, L.L.C. http://netbible.com All rights reserved.";

export type FooterCardLink = {
  href: string;
  title: string;
  label: string;
};

export function ArticleEndSection({
  articleSlug,
  next,
  secondary,
  previous,
  navigationId,
}: {
  articleSlug: string;
  next?: FooterCardLink;
  secondary?: FooterCardLink & { back?: boolean };
  previous?: { href: string; label: string };
  navigationId?: string;
}) {
  return (
    <section aria-label="After this article" className="mt-10">
      <ArticleReaction articleSlug={articleSlug} compact />

      {(next || secondary || previous) && (
        <div id={navigationId} className="mt-8 scroll-mt-6">
          {(next || secondary) && (
            <nav
              aria-label="Continue reading"
              className={`grid gap-3 sm:gap-4 ${next && secondary ? "sm:grid-cols-[1.3fr_0.7fr]" : ""}`}
            >
              {next && (
                <Link
                  href={next.href}
                  className="group min-w-0 rounded-xl border border-blue-900 border-t-4 border-t-warm-500 bg-blue-900 p-5 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-950 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:p-7"
                >
                  <span className="block text-xs font-bold uppercase tracking-wide text-blue-100 sm:text-sm">
                    {next.label}
                  </span>
                  <h2 className="mt-2 flex items-start justify-between gap-3 font-serif text-xl font-bold leading-tight text-white sm:text-3xl">
                    <span className="min-w-0 break-words">{next.title}</span>
                    <ArrowRight className="h-6 w-6 shrink-0 text-white transition-transform group-hover:translate-x-1 sm:h-8 sm:w-8" aria-hidden="true" />
                  </h2>
                </Link>
              )}
              {secondary && (
                <Link
                  href={secondary.href}
                  className="group min-w-0 rounded-xl border border-border-soft bg-white p-5 text-navy shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:p-6"
                >
                  <span className="block text-xs font-bold uppercase tracking-wide text-slate sm:text-sm">
                    {secondary.label}
                  </span>
                  <h2 className="mt-2 flex items-start gap-3 text-lg font-bold leading-snug text-navy sm:text-xl">
                    {secondary.back && <ArrowLeft className="h-5 w-5 shrink-0 text-brand transition-transform group-hover:-translate-x-1 sm:h-6 sm:w-6" aria-hidden="true" />}
                    <span className="min-w-0 break-words">{secondary.title}</span>
                    {!secondary.back && <ArrowRight className="h-5 w-5 shrink-0 text-brand transition-transform group-hover:translate-x-1 sm:h-6 sm:w-6" aria-hidden="true" />}
                  </h2>
                </Link>
              )}
            </nav>
          )}
          {previous && (
            <Link
              href={previous.href}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {previous.label}
            </Link>
          )}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-warm-200 bg-warm-50 p-4 text-center text-navy shadow-sm sm:p-5">
        <h2 className="mx-auto max-w-2xl text-base font-bold leading-snug sm:text-lg">
          Have a question or need help with your next step?
        </h2>
        <Button asChild variant="warm" size="sm" className="mt-3 bg-warm-700 text-white shadow-sm hover:bg-warm-800">
          <Link href="/message">Send Us a Message</Link>
        </Button>
      </div>

      <p className="mt-8 border-t border-border-soft pt-8 text-center text-xs leading-relaxed text-slate">
        Scripture references open an accessible NET Bible preview. {NET_COPYRIGHT}
      </p>
    </section>
  );
}