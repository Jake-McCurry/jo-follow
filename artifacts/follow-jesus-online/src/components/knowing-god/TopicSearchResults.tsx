import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { kjvScriptureHref } from "./knowing-god-ui";
import type { ScriptureResult } from "./knowing-god-ui";

type SearchTopic = { id: string; title: string; passageCount: number; recordType: string };
const BATCH = 20;

export function TopicSearchResults({
  query, topics, scripture, topicTitle, loading, error, searchingContent, contentError, onRetry, onSelect, onClear, searchControl,
}: {
  query: string;
  topics: SearchTopic[];
  scripture: ScriptureResult[];
  topicTitle: (id: string) => string | undefined;
  loading: boolean;
  error: string;
  searchingContent: boolean;
  contentError: boolean;
  onRetry: () => void;
  onSelect: (id: string) => void;
  onClear: () => void;
  searchControl?: ReactNode;
}) {
  const [shown, setShown] = useState(BATCH);
  useEffect(() => setShown(BATCH), [query]);
  const q = query.trim();
  const muted = "kg-sans text-sm text-[var(--color-text-muted,#2E5A7A)]";

  return (
    <section id="topic-search-results" className="kg-reading order-3 min-w-0 max-w-[920px] px-5 py-5 md:order-none md:px-10 md:py-8 lg:px-14"
      aria-labelledby="topic-search-heading" data-testid="panel-topic-search-results" data-search-complete={!loading && !searchingContent && !contentError}>
      {searchControl}
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="topic-search-heading" className="text-2xl text-[var(--color-hero,#006BB3)] md:text-3xl">{q ? "Search results" : "Search Knowing God"}</h2>
        {q && <button type="button" onClick={onClear} data-testid="button-clear-topic-search"
          className="kg-focus kg-sans hidden min-h-11 rounded border border-[var(--color-border-control,#5B9BC4)] px-4 py-2 text-sm font-bold text-[var(--color-text,#003A66)] hover:bg-[var(--color-surface-soft,#E6F5FF)] md:inline-block">Clear search</button>}
      </div>
      {error ? <p role="alert" className="kg-sans text-[var(--color-action-warm,#C45100)]">{error}</p>
        : loading ? <p role="status" className={muted}>Loading complete topical index…</p>
        : !q ? <p className={`${muted} text-base`} data-testid="text-topic-search-empty">Enter a word or phrase to search topic titles and Scripture.</p>
        : <>
          <h3 className="kg-sans text-lg font-bold text-[var(--color-text,#003A66)]" data-testid="heading-topic-results">
            Topic results <span className="font-normal text-sm text-[var(--color-text-muted,#2E5A7A)]">{topics.length}</span>
          </h3>
          {topics.length === 0 ? <p className={`${muted} mb-6 mt-2`}>No topic titles match “{q}”.</p> :
            <ul className="mb-7 mt-2 flex flex-wrap gap-2" aria-label="Matching topics">
              {topics.map(topic => <li key={topic.id}>
                <button type="button" onClick={() => onSelect(topic.id)} data-testid={`button-topic-search-${topic.id}`}
                  className="kg-focus min-h-11 rounded border border-[var(--color-border-control,#5B9BC4)] bg-[var(--color-surface,#FFFDFB)] px-3 py-2 text-left text-base font-semibold text-[var(--color-hero,#006BB3)] hover:bg-[var(--color-selected-warm,#FFEADB)]">
                  {topic.title} <span className="kg-sans text-xs font-normal text-[var(--color-text-muted,#2E5A7A)]">{topic.recordType === "cross-reference" ? "see" : topic.passageCount}</span>
                </button>
              </li>)}
            </ul>}
          <h3 className="kg-sans text-lg font-bold text-[var(--color-text,#003A66)]" data-testid="heading-scripture-results">
            Scripture results <span className="font-normal text-sm text-[var(--color-text-muted,#2E5A7A)]">{scripture.length}{searchingContent ? "+" : ""}</span>
          </h3>
          <p className={`${muted} mt-1`}>Searches the original KJV text of every topic. Links open the KJV passage.</p>
          {searchingContent && <p role="status" className={`${muted} mt-2`}>Searching all topics…</p>}
          {contentError && <p role="alert" className="kg-sans mt-2 text-sm text-[var(--color-action-warm,#C45100)]">
            Some topics could not be searched; partial results are shown.{" "}
            <button type="button" onClick={onRetry} data-testid="button-retry-topic-search" className="kg-focus min-h-11 font-bold underline">Retry search</button>
          </p>}
          {!searchingContent && scripture.length === 0 && <p className={`${muted} mt-2`}>No KJV passages contain “{q}”.</p>}
          <ol className="mt-2">
            {scripture.slice(0, shown).map(result => <li key={`${result.reference}-${result.topicIds.join(",")}`} className="border-b border-[var(--color-border-soft,#CCEBFF)] py-3">
              <a href={kjvScriptureHref(result.reference, import.meta.env.BASE_URL)} target="_blank" rel="noopener noreferrer" data-testid={`link-scripture-result-${result.reference}`}
                className="kg-focus kg-sans font-bold text-[var(--color-hero,#006BB3)] underline underline-offset-2">{result.reference} <span className="text-xs font-normal">KJV</span><span className="sr-only"> (opens KJV Bible in a new tab)</span></a>
              <p className="mt-1 text-base leading-relaxed text-[var(--color-text,#003A66)]">{result.excerpt}</p>
              <p className={`${muted} mt-1 text-xs`}>In: {result.topicIds.map((id, i) => <span key={id}>
                <button type="button" onClick={() => onSelect(id)} className="kg-focus underline underline-offset-2">{topicTitle(id) ?? id}</button>{i < result.topicIds.length - 1 ? ", " : ""}</span>)}</p>
            </li>)}
          </ol>
          {scripture.length > shown && <button type="button" onClick={() => setShown(n => n + BATCH)} data-testid="button-more-scripture-results"
            className="kg-focus kg-sans mt-4 min-h-11 rounded border border-[var(--color-border-control,#5B9BC4)] px-4 py-2 text-sm font-bold text-[var(--color-text,#003A66)] hover:bg-[var(--color-surface-soft,#E6F5FF)]">
            Show more Scripture results <span className="font-normal">({scripture.length - shown} more)</span></button>}
        </>}
    </section>
  );
}
