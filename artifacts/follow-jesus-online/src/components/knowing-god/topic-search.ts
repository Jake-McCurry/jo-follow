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