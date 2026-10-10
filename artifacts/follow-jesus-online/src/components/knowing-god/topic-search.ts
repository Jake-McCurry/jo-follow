import { devotionalTopicKey } from "./devotional-topics";

/** Keep literal title ranking, while accepting punctuation variants used
 * by the original devotional guide (e.g. Non-impossibilitation). */
export function topicTitleSearchRank(title: string, query: string): number {
  const text = title.trim().toLocaleLowerCase();
  const q = query.trim().toLocaleLowerCase();
  if (!q) return 4;
  const textKey = devotionalTopicKey(title);
  const queryKey = devotionalTopicKey(query);
  if (text === q || (queryKey && textKey === queryKey)) return 0;
  if (text.startsWith(q) || (queryKey && textKey.startsWith(queryKey))) return 1;
  if (text.includes(q) || (queryKey && textKey.includes(queryKey))) return 2;
  return 4;
}

type SearchableIndex = { id: string; title: string; letter: string };
type SearchableTopic = { id: string; definition: string; passages: { reference: string; text: string }[] };
export type TopicSearchMatch = "title" | "reference" | "content";
const normalizeSearch = (value: string) => value.normalize("NFKC")
  .replace(/[‘’]/g, "'").replace(/[–—]/g, "-").trim().toLocaleLowerCase();

/** Title hits always precede reference and content hits; each topic appears once. */
export function searchKnowingGodTopics<T extends SearchableIndex>(
  topics: T[],
  payloads: Record<string, SearchableTopic[]>,
  query: string,
): (T & { searchMatch: TopicSearchMatch })[] {
  const q = normalizeSearch(query);
  if (!q) return [];
  const ranked: { item: T; rank: number; match: TopicSearchMatch }[] = [];
  for (const item of topics) {
    const titleRank = topicTitleSearchRank(item.title, query);
    if (titleRank < 4) {
      ranked.push({ item, rank: titleRank, match: "title" });
      continue;
    }
    const loaded = payloads[item.letter]?.find(topic => topic.id === item.id);
    if (!loaded) continue;
    if (loaded.passages.some(passage => normalizeSearch(passage.reference).includes(q))) {
      ranked.push({ item, rank: 3, match: "reference" });
    } else if (normalizeSearch(loaded.definition).includes(q) ||
      loaded.passages.some(passage => normalizeSearch(passage.text).includes(q))) {
      ranked.push({ item, rank: 4, match: "content" });
    }
  }
  return ranked.sort((a, b) => a.rank - b.rank || a.item.title.localeCompare(b.item.title))
    .map(({ item, match }) => ({ ...item, searchMatch: match }));
}