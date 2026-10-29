import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { ChevronLabel } from "@/components/navigation-chevrons";
import { getArticlePath, getArticlesInGroup } from "@/data/article-library";

const chapters = getArticlesInGroup("adventure");
const pdfHref = `${import.meta.env.BASE_URL}adventure-guide.pdf`;

export function AdventureIndexPage() {
  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-5 py-12 sm:px-8 md:py-16">
        <header className="mb-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-6 flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-warm-300 sm:w-24" />
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-warm-700 sm:text-sm">The Guide</span>
            <div className="h-px w-12 bg-warm-300 sm:w-24" />
          </div>
          <h1 className="mb-6 font-serif text-4xl font-bold leading-[1.15] tracking-tight text-navy sm:text-5xl" data-testid="text-adv-title">
            The Adventure of Living with Jesus
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate sm:text-[19px]">
            Ten short readings for your first steps with Jesus. Start at the beginning, or open the chapter that meets you today.
          </p>
        </header>

        <ol className="overflow-hidden rounded-xl border border-card-border bg-card shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700" data-testid="list-adv-chapters">
          {chapters.map((chapter, index) => (
            <li key={chapter.slug} className="border-b border-warm-100 last:border-b-0">
              <Link
                href={getArticlePath(chapter.slug)}
                data-testid={`link-adv-chapter-${chapter.slug}`}
                className="group flex items-center gap-4 px-5 py-5 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:gap-6 sm:px-8"
              >
                <span className="w-7 shrink-0 font-serif text-2xl font-bold tabular-nums text-warm-500 sm:w-9 sm:text-3xl" aria-hidden="true">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 text-lg font-bold leading-snug text-navy transition-colors group-hover:text-brand sm:text-xl">
                  <ChevronLabel text={chapter.title} />
                </span>
              </Link>
            </li>
          ))}
        </ol>

        <p className="mt-10 text-center text-sm text-slate">
          Prefer paper?{" "}
          <a href={pdfHref} className="font-semibold text-warm-700 underline underline-offset-4 hover:text-warm-800" data-testid="link-adv-pdf">
            Download the guide as a PDF
          </a>
        </p>
      </div>
    </Layout>
  );
}
