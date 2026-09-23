const RECENT_PAGE_KEY = "jol_recent_page";

const EXCLUDED_PATHS = ["/", "/message", "/xp-pages"];

export function isTrackablePage(location: string): boolean {
  return !EXCLUDED_PATHS.includes(location) && !location.startsWith("/admin/");
}

export function isSamePage(left: string, right: string): boolean {
  const normalize = (page: string) => page.split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  return normalize(left) === normalize(right);
}

export function saveRecentPage(location: string) {
  if (!isTrackablePage(location)) return;
  try {
    localStorage.setItem(RECENT_PAGE_KEY, location);
  } catch (e) {
    // ignore
  }
}

export function getRecentPage(): string | null {
  try {
    const page = localStorage.getItem(RECENT_PAGE_KEY);
    return page?.startsWith("/") && !page.startsWith("//") ? page : null;
  } catch (e) {
    return null;
  }
}

export function clearRecentPage() {
  try {
    localStorage.removeItem(RECENT_PAGE_KEY);
  } catch (e) {
    // ignore
  }
}
