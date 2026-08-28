import { useEffect } from "react";
import { useLocation } from "wouter";

const RECENT_PAGE_KEY = "jol_recent_page";

const EXCLUDED_PATHS = ["/", "/message", "/xp-pages"];

export function useTrackRecentPage() {
  const [location] = useLocation();

  useEffect(() => {
    if (!EXCLUDED_PATHS.includes(location) && !location.startsWith("/adv-") && !location.startsWith("/deeper-") && !location.startsWith("/more-")) {
      try {
        localStorage.setItem(RECENT_PAGE_KEY, location);
      } catch (e) {
        // ignore
      }
    }
  }, [location]);
}

export function getRecentPage(): string | null {
  try {
    return localStorage.getItem(RECENT_PAGE_KEY);
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
