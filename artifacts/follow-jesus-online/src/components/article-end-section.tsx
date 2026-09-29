import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArticleReaction } from "@/components/article-reaction";
import { Button } from "@/components/ui/button";

const NET_COPYRIGHT =
  "Scripture quoted by permission. Quotations designated (NET) are from the NET Bible® copyright ©1996, 2019 by Biblical Studies Press, L.L.C. http://netbible.com All rights reserved.";

export function ArticleEndSection({
  articleSlug,
  compactReaction = false,
  children,
}: {
  articleSlug: string;
  compactReaction?: boolean;
  children?: ReactNode;
}) {
  return (
    <section aria-label="After this article" className="mt-10">
      <ArticleReaction articleSlug={articleSlug} compact={compactReaction} />

      {children && <div className="mt-8">{children}</div>}

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