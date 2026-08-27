import { type ReactNode, useState } from "react"
import { Link } from "wouter"
import { Menu, X } from "lucide-react"

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
        <div className="mx-auto flex h-[70px] max-w-[1800px] items-center justify-between px-6 sm:px-10">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-sm p-1 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0095ff]"
            aria-label="Follow Jesus Online home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-white font-serif text-2xl font-bold leading-none" aria-hidden="true">
              J
            </span>
            <span className="text-[25px] font-light tracking-[0.035em] sm:text-[27px]">
              JESUSONLINE
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="rounded-sm p-2 text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-expanded={isMenuOpen}
            aria-controls="site-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
        {isMenuOpen && (
          <nav id="site-menu" className="border-t border-white/25 bg-[#0095ff]" aria-label="Main navigation">
            <div className="mx-auto flex max-w-[1800px] flex-col px-6 py-5 sm:px-10">
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