import { Link } from "wouter";
import { ChevronLabel } from "@/components/navigation-chevrons";
import { getGFBook } from "@/data/go-further-library";
import type { ArticleBlock } from "@/data/article-library";

/** Keep the supplied book copy, using the existing Go Further contents layout. */
export function BecauseBookContents({ blocks, bookSlug }: { blocks: ArticleBlock[]; bookSlug: string }) {
  const book = getGFBook(bookSlug);
  if (!book) throw new Error(`Unknown Because statements eBook: ${bookSlug}`);
  const contentsIndex = blocks.findIndex(block => block.text === "Contents");
  const chapters = book.readings.map((reading, index) => {
    const offset = contentsIndex + 1 + index * 3;
    const [label, title, description] = blocks.slice(offset, offset + 3);
    if (!label?.text.startsWith("Chapter ") || !title || !description) {
      throw new Error(`Incomplete Because statements contents: ${bookSlug}`);
    }
    return { label: label.text, title: title.text, description: description.text, href: `/gf/${bookSlug}/${reading.slug}` };
  });
  const closingIndex = contentsIndex + 1 + chapters.length * 3;
  const closing = blocks[closingIndex]?.text;
  const startLabel = blocks[closingIndex + 1]?.text;
  if (!closing || !startLabel || !book.ebookHref) throw new Error(`Incomplete eBook footer: ${bookSlug}`);

  return (
    <section className="mt-16 border-t border-warm-300 pt-12" aria-label={`Go deeper with ${book.title}`}>
      <p className="mb-4 text-sm font-bold uppercase tracking-widest text-warm-700">{blocks[0].text}</p>
      <h2 className="font-serif text-3xl font-bold uppercase leading-tight text-navy sm:text-4xl">{blocks[1].text}</h2>
      <p className="mt-4 text-lg leading-relaxed text-slate">{blocks[2].text}</p>
      <p className="mt-10">
        <a href={book.ebookHref} target="_blank" rel="noopener noreferrer" className="font-semibold text-navy underline underline-offset-4 hover:text-brand">
          {blocks[3].text}
        </a>
      </p>
      <nav aria-label={`Contents of ${book.title}`} className="mt-6">
        <h3 className="mb-6 flex items-center gap-3 text-2xl font-bold text-navy sm:text-3xl">
          <span className="hidden h-px w-12 bg-warm-300 sm:block" aria-hidden="true" />
          Contents
        </h3>
        <ol className="border-t border-warm-300">
          {chapters.map(chapter => (
            <li key={chapter.href} className="border-b border-warm-300">
              <Link href={chapter.href} className="group block py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                <span className="text-xs font-bold uppercase tracking-wide text-warm-700 sm:text-sm">{chapter.label}</span>
                <h4 className="mt-2 font-serif text-xl font-bold text-navy transition-colors group-hover:text-brand sm:text-2xl"><ChevronLabel text={chapter.title} /></h4>
                <p className="mt-2 text-base leading-relaxed text-slate">{chapter.description}</p>
              </Link>
            </li>
          ))}
        </ol>
      </nav>
      <div className="mt-16 rounded-xl bg-card p-6 text-center sm:p-8">
        <p className="text-lg italic leading-relaxed text-navy">{closing}</p>
        <Link href={chapters[0].href} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          <ChevronLabel text={startLabel} />
        </Link>
      </div>
    </section>
  );
}
