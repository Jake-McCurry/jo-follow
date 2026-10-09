type SearchTopic = { id: string; title: string; passageCount: number };

export function TopicSearchResults({
  query,
  topics,
  loading,
  error,
  onSelect,
  onClear,
}: {
  query: string;
  topics: SearchTopic[];
  loading: boolean;
  error: string;
  onSelect: (id: string) => void;
  onClear: () => void;
}) {
  return (
    <section
      id="topic-search-results"
      className="kg-reading min-w-0 max-w-[920px] px-5 py-8 md:px-10 md:py-12 lg:px-14"
      aria-labelledby="topic-search-heading"
      data-testid="panel-topic-search-results"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="topic-search-heading" className="text-3xl text-[var(--color-hero,#006BB3)] md:text-4xl">Search results</h2>
          <p role="status" className="kg-sans mt-3 text-base text-[var(--color-text-muted,#2E5A7A)]" data-testid="status-topic-search">
            {loading ? "Loading complete topical index…" : `${topics.length} ${topics.length === 1 ? "topic" : "topics"} found for “${query.trim()}”`}
          </p>
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
      {error ? <p role="alert" className="kg-sans text-[var(--color-action-warm,#C45100)]">{error}</p> :
        !loading && topics.length === 0 ? (
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
                  <span className="text-xl font-semibold text-[var(--color-hero,#006BB3)]">{topic.title}</span>
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
