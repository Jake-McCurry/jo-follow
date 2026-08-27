import { type ReactNode, useState } from "react"
import { Link } from "wouter"

export function Layout({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-sm bg-white px-4 py-2 font-semibold text-[#073192] shadow-md focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-[#073192]"
      >
        Skip to Scripture
      </a>
      <header className="sticky top-0 z-40 w-full bg-[#0095ff] shadow-sm">
        <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between px-5 sm:px-8 md:h-[70px]">
          <Link
            href="/"
            className="inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0095ff]"
            aria-label="JesusOnline home"
          >
            <img
              src="https://jesusonline.org/jesusonline-wordmark.png"
              alt="JesusOnline"
              width="320"
              height="57"
              className="h-8 w-auto sm:h-11"
            />
          </Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-expanded={isMenuOpen}
            aria-controls="site-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className={`block h-0.5 w-6 rounded-full bg-white transition-all duration-200 origin-center ${isMenuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 rounded-full bg-white transition-all duration-200 ${isMenuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 rounded-full bg-white transition-all duration-200 origin-center ${isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>
        {isMenuOpen && (
          <nav id="site-menu" className="border-t border-white/25 bg-[#0095ff]" aria-label="Main navigation">
            <div className="mx-auto flex max-w-[1800px] flex-col px-5 py-5 sm:px-8">
              <a
                href="https://jesusonline.org"
                className="border-b border-white/20 py-3 text-base font-semibold text-white hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Discover Jesus
              </a>
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-white/20 py-3 text-base font-semibold text-white hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Read the Bible
              </Link>
              <a
                href="https://equip.jesusonline.com"
                className="py-3 text-base font-semibold text-white hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Equip others
              </a>
            </div>
          </nav>
        )}
      </header>

      <main id="main-content" className="flex-1 w-full animate-in fade-in duration-500">
        {children}
      </main>

      <footer className="mt-12 border-t bg-[#122B49] py-9 text-white">
        <div className="mx-auto max-w-4xl px-6 text-center text-sm text-white/80">
          <p>© {new Date().getFullYear()} JesusOnline Ministries. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}