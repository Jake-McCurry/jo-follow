export function topicIdFromHash(hash: string): string | null;
export function pushTopicHash(browser: Pick<Window, "history">, topicId: string): void;
export function subscribeToTopicHistory(
  browser: Pick<Window, "addEventListener" | "removeEventListener">,
  restore: () => void,
): () => void;
