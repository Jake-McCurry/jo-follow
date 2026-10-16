const RECENT_PAGE_KEY = "jol_recent_page";
const RESUME_SESSION_KEY = "jol_resume_session_started";
let fallbackSessionStarted = false;

/** Consume the offer once per tab session, before tracking its first page. */
export function takeSessionResumePage(): string | null {
  try {
    if (sessionStorage.getItem(RESUME_SESSION_KEY)) return null;
    sessionStorage.setItem(RESUME_SESSION_KEY, "1");
  } catch {
    if (fallbackSessionStarted) return null;
    fallbackSessionStarted = true;
  }
  return getRecentPage();
}

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
