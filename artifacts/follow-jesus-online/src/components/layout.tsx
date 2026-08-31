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
        Skip to main content
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
            className="flex items-center gap-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white text-white font-medium tracking-wide"
            aria-expanded={isMenuOpen}
            aria-controls="site-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className="inline-block pl-1 text-sm sm:text-base">MENU</span>
            <div className="flex h-10 w-6 flex-col items-center justify-center gap-[5px]">
              <span className={`block h-0.5 w-6 rounded-full bg-white transition-all duration-200 origin-center ${isMenuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`block h-0.5 w-6 rounded-full bg-white transition-all duration-200 ${isMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-6 rounded-full bg-white transition-all duration-200 origin-center ${isMenuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
        {isMenuOpen && (
          <nav id="site-menu" className="border-t border-white/25 bg-[#0095ff]" aria-label="Main navigation">
            <div className="mx-auto flex max-w-[1800px] flex-col px-5 py-5 sm:px-8">
              <Link
                href="/adv-begin-the-adventure"
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-white/20 py-3 text-base font-semibold text-white hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Begin the Guide
              </Link>
              <Link
                href="/gf/"
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-white/20 py-3 text-base font-semibold text-white hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Go Further
              </Link>
              <Link
                href="/adv-citizen-of-heaven"
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-white/20 py-3 text-base font-semibold text-white hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Going to Heaven?
              </Link>
              <Link
                href="/rewatch"
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-white/20 py-3 text-base font-semibold text-white hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Rewatch the Video
              </Link>
              <Link
                href="/bible"
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-white/20 py-3 text-base font-semibold text-white hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Read the NET Bible
              </Link>
              <Link
                href="/adv-prayer"
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-white/20 py-3 text-base font-semibold text-white hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Connect with God
              </Link>
              <Link
                href="/message"
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-white/20 py-3 text-base font-semibold text-white hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Send a Message
              </Link>
              <Link
                href="/xp-pages"
                onClick={() => setIsMenuOpen(false)}
                className="py-3 text-base font-semibold text-white hover:text-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Return to Start Page
              </Link>
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
          <a
            href="https://jesusonlineministries.org/privacy-policy/"
            className="mt-3 inline-block underline underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#122B49]"
          >
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  )
}