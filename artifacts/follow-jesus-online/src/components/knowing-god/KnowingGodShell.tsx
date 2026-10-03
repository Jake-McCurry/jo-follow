import { type ReactNode, useLayoutEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import "@/styles/knowing-god-fonts.css";
import "@/styles/knowing-god-scope.css";
import "@/styles/knowing-god-theme.css";
import "@/styles/knowing-god-intro.css";

/** The full reader lives inside Follow's existing navigation and layout. */
export function KnowingGodShell({ children, warmWrapper = false }: { children: ReactNode; warmWrapper?: boolean }) {
  const page = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const header = page.current?.querySelector<HTMLElement>("[data-site-header]");
    if (!header) return;
    const measure = () => page.current?.style.setProperty("--kg-header-height", `${header.getBoundingClientRect().height}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="kg-page" ref={page}>
      <Layout>
        <div className="kg-root">
          {warmWrapper
            ? <div className="kg-warm-theme kg-intro-theme-wrapper flex-1">{children}</div>
            : children}
        </div>
      </Layout>
    </div>
  );
}
