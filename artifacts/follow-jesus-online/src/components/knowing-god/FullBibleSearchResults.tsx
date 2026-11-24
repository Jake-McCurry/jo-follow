import { useRef } from "react";
import { useFullBibleSearch } from "../../hooks/use-full-bible-search";
import { normalizeBibleSearch, BIBLE_SEARCH_PAGE_SIZE, type BibleTranslation } from "../../lib/full-bible-search";
import { scriptureResultHref } from "./knowing-god-ui";
import { ChevronLabel } from "../navigation-chevrons";

export function FullBibleSearchResults({ query, translation, testament, book }: {
  query: string; translation: BibleTranslation; testament: string; book: string;
}) {
  const { response, setPage, retry } = useFullBibleSearch(query, translation, testament, book);
  const heading = useRef<HTMLHeadingElement>(null);
  const pending = !response || response.status === "loading";
  const button = "kg-focus inline-flex min-h-11 items-center rounded border border-[var(--color-border-control,#5B9BC4)] px-3 py-2 text-sm font-bold disabled:opacity-40";
  const changePage = (page: number) => {
    setPage(page);
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
  };
  if (!normalizeBibleSearch(query)) return null;
  return <section className="mt-8 border-t border-[var(--color-border-soft,#CCEBFF)] pt-6" aria-labelledby="full-bible-search-heading" data-testid="panel-full-bible-search" aria-busy={pending}>
    <h3 ref={heading} tabIndex={-1} id="full-bible-search-heading" className="kg-sans scroll-mt-40 text-lg font-bold text-[var(--color-text,#003A66)]">
      Full Bible results — {translation}
    </h3>
    <p className="kg-sans mt-1 text-sm text-[var(--color-text-muted,#2E5A7A)]">Searches all 66 books in {translation}, within the selected passage filters.</p>
    <div aria-live="polite" className="mt-2 text-sm">
      {pending ? <p role="status">Searching the {translation} Bible…</p> : response.status === "error" ?
        <p role="alert">{response.error} <button type="button" onClick={retry} className="kg-focus min-h-11 underline">Retry Bible search</button></p> :
        <p data-testid="text-full-bible-result-count">{response.total ? `${(response.page - 1) * BIBLE_SEARCH_PAGE_SIZE + 1}–${Math.min(response.page * BIBLE_SEARCH_PAGE_SIZE, response.total)} of ${response.total.toLocaleString()} matching verses` : `No ${translation} Bible verses match “${query.trim()}” within the selected passage filters.`}</p>}
    </div>
    {response?.status === "success" && <>
      <ol className="mt-2">
        {response.results.map(result => <li key={result.reference} className="border-b border-[var(--color-border-soft,#CCEBFF)] py-3">
          <a href={scriptureResultHref(result.reference, translation, import.meta.env.BASE_URL)} target="_blank" rel="noopener noreferrer"
            className="kg-focus font-bold text-[var(--color-hero,#006BB3)] underline underline-offset-2" data-testid={`link-full-bible-${result.reference}`}>
            {result.reference}<span className="sr-only"> (opens {translation} Bible in a new tab)</span>
          </a>
          <p className="mt-1 text-base leading-relaxed">{result.text}{" "}
            {translation === "NET" ? <a href="https://netbible.org/" target="_blank" rel="noopener noreferrer" className="kg-focus text-xs underline">(NET)</a> : <span className="text-xs">(KJV)</span>}
          </p>
        </li>)}
      </ol>
      {response.pages > 1 && <nav aria-label="Full Bible search pages" className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <button type="button" className={button} disabled={response.page <= 1} onClick={() => changePage(response.page - 1)}><ChevronLabel text="Previous" direction="left" /></button>
        <span className="text-sm">Page {response.page} of {response.pages}</span>
        <button type="button" className={button} disabled={response.page >= response.pages} onClick={() => changePage(response.page + 1)}><ChevronLabel text="Next" /></button>
      </nav>}
      {response.coverageNotes && <details className="mt-4 text-xs leading-relaxed text-[var(--color-text-muted,#2E5A7A)]">
        <summary className="kg-focus cursor-pointer py-2">About NET verse numbering</summary><p>{response.coverageNotes}</p>
      </details>}
    </>}
    <p className="mt-4 text-xs leading-relaxed text-[var(--color-text-muted,#2E5A7A)]">
      {translation === "NET" ? <>Scripture quoted by permission. Quotations designated (NET) are from the NET Bible® copyright ©1996, 2019 by Biblical Studies Press, L.L.C. <a href="https://netbible.com" target="_blank" rel="noopener noreferrer" className="kg-focus underline">netbible.com</a>. All rights reserved.</> :
        <>King James Version (KJV). Public domain outside the United Kingdom.</>}
    </p>
  </section>;
}
