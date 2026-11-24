import { devotionalGuideCategories } from "../../data/knowing-god/introduction/devotional-guide.ts";
import { devotionalTopicKey } from "./devotional-topics.ts";
import { knowingGodScriptureHref } from "./scripture-link.ts";
import { compareBibleReferences } from "../../lib/bible-order.ts";

type IndexTopic = { id: string; title: string; recordType: string };

/** Substantive topics exclude cross-reference-only "See…" entries. */
export const isSubstantive = (topic: { recordType: string }) => topic.recordType !== "cross-reference";
export const countSubstantive = (topics: { recordType: string }[]) => topics.filter(isSubstantive).length;

export type DevotionalChild = { key: string; label: string; topicId?: string };
export type DevotionalGroup = { key: string; heading: string; children: DevotionalChild[] };

/** Resolve the Devotional Guide (PDF pp. 11–18) hierarchy against the index,
 * preserving source order. Children point at the single underlying article. */
export function buildDevotionalHierarchy(topics: IndexTopic[]): DevotionalGroup[] {
  const byKey = new Map<string, IndexTopic>();
  for (const topic of topics) {
    const key = devotionalTopicKey(topic.title);
    const existing = byKey.get(key);
    if (!existing || (!isSubstantive(existing) && isSubstantive(topic))) byKey.set(key, topic);
  }
  return devotionalGuideCategories.map((category, groupIndex) => ({
    key: `${groupIndex}-${devotionalTopicKey(category.heading)}`,
    heading: category.heading,
    children: category.entries.map((entry, childIndex) => ({
      key: `${groupIndex}-${childIndex}`,
      label: entry.topic,
      topicId: byKey.get(devotionalTopicKey(entry.topic))?.id,
    })),
  }));
}

/** Topics count once even when they belong to several groups. */
export const uniqueDevotionalCount = (groups: DevotionalGroup[]) =>
  new Set(groups.flatMap(group => group.children.map(child => child.topicId).filter(Boolean))).size;

const fold = (value: string) => value.normalize("NFKC").replace(/[‘’]/g, "'").replace(/[–—]/g, "-").toLocaleLowerCase();

/** A short excerpt around the first match, with ellipses where trimmed. */
export function scriptureExcerpt(text: string, query: string, radius = 70): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const at = fold(clean).indexOf(fold(query.trim()));
  if (at < 0) return clean.length > radius * 2 ? `${clean.slice(0, radius * 2).trimEnd()}…` : clean;
  const start = Math.max(0, at - radius);
  const end = Math.min(clean.length, at + query.trim().length + radius);
  return `${start > 0 ? "…" : ""}${clean.slice(start, end).trim()}${end < clean.length ? "…" : ""}`;
}

export type ScriptureResult = { reference: string; text: string; excerpt: string; topicIds: string[] };

/** Search only the selected text; missing NET passages never fall back to KJV. */
export function searchScripturePassages(
  topics: { id: string; passages: { reference: string; text: string }[] }[],
  query: string,
  translation: "NET" | "KJV" = "KJV",
  netText: ReadonlyMap<string, string> = new Map(),
): ScriptureResult[] {
  const q = fold(query.trim());
  if (!q) return [];
  const merged = new Map<string, ScriptureResult>();
  for (const topic of topics) {
    for (const passage of topic.passages) {
      const text = translation === "NET" ? netText.get(passage.reference) : passage.text;
      if (!text || !fold(text).includes(q)) continue;
      const key = `${passage.reference.trim()}\u0000${text.replace(/\s+/g, " ").trim()}`;
      const found = merged.get(key);
      if (found) { if (!found.topicIds.includes(topic.id)) found.topicIds.push(topic.id); continue; }
      merged.set(key, { reference: passage.reference, text, excerpt: scriptureExcerpt(text, query), topicIds: [topic.id] });
    }
  }
  return [...merged.values()].sort((a, b) => compareBibleReferences(a.reference, b.reference));
}

/** Search result links use the same translation as their displayed text. */
export function scriptureResultHref(reference: string, translation: "NET" | "KJV", baseUrl = "/"): string {
  const href = knowingGodScriptureHref(reference, baseUrl);
  const [path, hash] = href.split("#");
  return `${path}?version=${translation}${hash ? `#${hash}` : ""}`;
}

export const kjvScriptureHref = (reference: string, baseUrl = "/") => scriptureResultHref(reference, "KJV", baseUrl);

/** Flatten "See also" groups to unique destinations in source order. */
export function uniqueSeeAlsoTargets(related: { targetIds: string[] }[]): string[] {
  return [...new Set(related.flatMap(item => item.targetIds))];
}
