import type { TopicSearchMatch } from "./topic-search";

type SearchTopic = { id: string; title: string; passageCount: number; searchMatch?: TopicSearchMatch };

export function TopicSearchResults({
  query,
  topics,
  loading,
  error,
  searchingContent,
  contentError,
  onRetry,
  onSelect,
  onClear,
}: {
  query: string;
  topics: SearchTopic[];
  loading: boolean;
  error: string;
  searchingContent: boolean;
  contentError: boolean;
  onRetry: () => void;
  onSelect: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <section
      id="topic-search-results"
      className="kg-reading min-w-0 max-w-[920px] px-5 py-8 md:px-10 md:py-12 lg:px-14"
      aria-labelledby="topic-search-heading"
      data-testid="panel-topic-search-results"
      data-search-complete={!loading && !searchingContent && !contentError}
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="topic-search-heading" className="text-3xl text-[var(--color-hero,#006BB3)] md:text-4xl">Search results</h2>
          <p role="status" className="kg-sans mt-3 text-base text-[var(--color-text-muted,#2E5A7A)]" data-testid="status-topic-search">
            {loading ? "Loading complete topical index…" : `${topics.length} ${topics.length === 1 ? "topic" : "topics"} found for “${query.trim()}”`}
            {searchingContent && <span className="mt-1 block">Searching remaining topic text…</span>}
          </p>
          <p className="kg-sans mt-2 text-sm text-[var(--color-text-muted,#2E5A7A)]">Title matches first, then Scripture references and content.</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          data-testid="button-clear-topic-search"
          className="kg-focus kg-sans min-h-11 rounded border border-[var(--color-border-control,#5B9BC4)] px-4 py-2 text-sm font-bold text-[var(--color-text,#003A66)] hover:bg-[var(--color-surface-soft,#E6F5FF)]"
        >
          Clear search
        </button>
      </div>
      {contentError && (
        <p role="alert" className="kg-sans mb-4 text-[var(--color-action-warm,#C45100)]">
          Some topic text could not be searched. The available results are shown below.{" "}
          <button type="button" onClick={onRetry} data-testid="button-retry-topic-search" className="kg-focus font-bold underline">Retry search</button>
        </p>
      )}
      {error ? <p role="alert" className="kg-sans text-[var(--color-action-warm,#C45100)]">{error}</p> :
        !loading && !searchingContent && !contentError && topics.length === 0 ? (
          <p className="kg-sans py-6 text-lg text-[var(--color-text-muted,#2E5A7A)]" data-testid="text-topic-search-empty">
            No topics match that search. Try a different word or phrase.
          </p>
        ) : (
          <ul className="space-y-2" aria-label="Matching topics">
            {topics.map(topic => (
              <li key={topic.id}>
                <button
                  type="button"
                  onClick={() => onSelect(topic.id)}
                  data-testid={`button-topic-search-${topic.id}`}
                  className="kg-focus flex min-h-16 w-full items-center justify-between gap-4 rounded border border-[var(--color-border-soft,#CCEBFF)] bg-[var(--color-surface,#FFFDFB)] px-5 py-4 text-left hover:bg-[var(--color-selected-warm,#FFEADB)]"
                >
                  <span>
                    <span className="block text-xl font-semibold text-[var(--color-hero,#006BB3)]">{topic.title}</span>
                    {topic.searchMatch && <span className="kg-sans mt-1 block text-sm text-[var(--color-text-muted,#2E5A7A)]">
                      {topic.searchMatch === "title" ? "Title match" : topic.searchMatch === "reference" ? "Scripture reference match" : "Content match"}
                    </span>}
                  </span>
                  <span className="kg-sans shrink-0 text-sm text-[var(--color-text-muted,#2E5A7A)]">
                    {topic.passageCount} {topic.passageCount === 1 ? "passage" : "passages"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
    </section>
  );
}
