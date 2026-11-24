import type { ReactNode } from "react"
import { Link } from "wouter"
import { ExternalLink } from "lucide-react"
import { Layout } from "@/components/layout"
import { BrowserDrawing } from "@/components/translate/browser-drawing"

const SITE_NAME = "Follow Jesus Online"
const SITE_URL = "https://follow.jesusonline.com"

function Step({ n, title, children }: { n: number; title: ReactNode; children: ReactNode }) {
  return (
    <li className="flex gap-4">
      <span aria-hidden className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-warm-700 text-sm font-bold text-white">
        {n}
      </span>
      <div className="min-w-0">
        <span className="sr-only">Step {n}: </span>
        <p className="font-semibold text-navy">{title}</p>
        <div className="mt-0.5 text-[1.02rem] leading-relaxed text-foreground/85">{children}</div>
      </div>
    </li>
  )
}

function MethodLabel({ children }: { children: ReactNode }) {
  return <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-warm-700">{children}</p>
}

export function TranslatePage() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 md:py-12">
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex items-center gap-2 text-foreground/75">
            <li>
              <Link href="/" className="inline-flex min-h-[44px] items-center font-semibold text-warm-700 underline-offset-4 hover:underline" data-testid="link-breadcrumb-home">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page">Translate</li>
          </ol>
        </nav>

        <header className="mt-2">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-warm-700">Multilingual Access</p>
          <h1 className="mt-2 text-[clamp(2rem,6vw,3rem)] font-bold leading-[1.1] text-navy">Translate this Page</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/85">
            Use Google Translate to read {SITE_NAME} in your heart language. Pick the option that matches the device or browser you're using right now.
          </p>
        </header>

        <div className="mt-10 space-y-8">
          {/* Method 1 */}
          <section aria-labelledby="m1" className="rounded-2xl border-2 border-warm-500 bg-card p-5 shadow-[0_14px_30px_-20px_rgba(196,81,0,0.55)] sm:p-7" data-testid="section-method-chrome">
            <div className="flex flex-wrap items-center gap-3">
              <MethodLabel>Method 1</MethodLabel>
              <span className="rounded-full bg-warm-700 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white" data-testid="badge-recommended">Recommended</span>
            </div>
            <h2 id="m1" className="mt-2 text-2xl font-bold text-navy">Google Chrome (desktop)</h2>
            <p className="mt-1 text-foreground/75">Most of our visitors use Chrome.</p>
            <ol className="mt-5 space-y-4">
              <Step n={1} title="Right-click anywhere on the page.">A menu will appear.</Step>
              <Step n={2} title={<>Choose "Translate to [your language]".</>}>Chrome translates the entire page instantly using Google Translate.</Step>
              <Step n={3} title="Switch language if needed.">Click the small Google Translate icon in the address bar, then choose another target language.</Step>
            </ol>
            <div className="mt-6 grid max-w-[672px] grid-cols-1 gap-4 sm:grid-cols-2">
              <BrowserDrawing variant="chrome-menu" />
              <BrowserDrawing variant="chrome-address" />
            </div>
          </section>

          {/* Method 2 */}
          <section aria-labelledby="m2" className="rounded-2xl border border-warm-200 bg-card p-5 sm:p-7" data-testid="section-method-mobile">
            <MethodLabel>Method 2</MethodLabel>
            <h2 id="m2" className="mt-2 text-2xl font-bold text-navy">Mobile (Chrome / Safari)</h2>
            <div className="mt-5 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-navy">Chrome on Android</h3>
                <ol className="mt-3 space-y-3">
                  <Step n={1} title="Tap the three-dot menu (⋮)">at the top right.</Step>
                  <Step n={2} title="Tap Translate…">and pick your language.</Step>
                </ol>
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy">Safari on iPhone or iPad</h3>
                <ol className="mt-3 space-y-3">
                  <Step n={1} title="Tap the aA icon">at the left of the address bar.</Step>
                  <Step n={2} title="Tap Translate to [language].">
                    The first time, tap Enable Translation when prompted; after that, pages translate automatically. Requires iOS / iPadOS 15 or later.
                  </Step>
                </ol>
                <p className="mt-3 rounded-lg border-l-[3px] border-blue-300 bg-blue-50/60 px-3 py-2 text-sm text-foreground/80">
                  Note: Safari's built-in translation is provided by Apple, not Google. Depending on your iOS version, the page menu button may look different or appear in another spot.
                </p>
              </div>
            </div>
            <div className="mt-6 grid max-w-[448px] grid-cols-2 gap-4">
              <figure>
                <BrowserDrawing variant="android" />
                <figcaption className="mt-1 text-center text-sm text-foreground/70">Chrome · Android</figcaption>
              </figure>
              <figure>
                <BrowserDrawing variant="safari" />
                <figcaption className="mt-1 text-center text-sm text-foreground/70">Safari · iPhone</figcaption>
              </figure>
            </div>
          </section>

          {/* Method 3 */}
          <section aria-labelledby="m3" className="rounded-2xl border border-warm-200 bg-card p-5 sm:p-7" data-testid="section-method-any">
            <MethodLabel>Method 3</MethodLabel>
            <h2 id="m3" className="mt-2 text-2xl font-bold text-navy">Any browser — use Google Translate directly</h2>
            <ol className="mt-5 space-y-4">
              <Step n={1} title={
                <>Open{" "}
                  <a href="https://translate.google.com/?sl=en&tl=es&op=websites" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-warm-700 underline underline-offset-4" data-testid="link-google-translate">
                    translate.google.com<ExternalLink className="h-3.5 w-3.5" aria-hidden /><span className="sr-only"> (opens in a new tab)</span>
                  </a>.
                </>
              }>{null}</Step>
              <Step n={2} title={<>Choose "Websites".</>}>On the Google Translate site, click the Websites tab.</Step>
              <Step n={3} title="Paste this address.">
                <code className="my-2 block w-fit max-w-full select-all overflow-x-auto rounded-md border border-warm-200 bg-warm-50 px-3 py-2 font-mono text-sm text-navy" data-testid="text-site-url">{SITE_URL}</code>
                Pick your target language and click the arrow.
              </Step>
            </ol>
            <div className="mt-6 max-w-[384px]">
              <BrowserDrawing variant="google-translate" />
            </div>
          </section>
        </div>

        <aside className="mt-8 rounded-xl border-l-4 border-warm-700 bg-warm-50 px-5 py-4 text-foreground/85" data-testid="text-closing-note">
          <strong className="font-semibold text-navy">Heads up:</strong> Google Translate is a third-party machine translation. Theological terms may not always translate perfectly. For high-fidelity translations in 40+ languages, also visit{" "}
          <a href="https://jesusonline.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-warm-700 underline underline-offset-4" data-testid="link-jesusonline">
            jesusonline.com<span className="sr-only"> (opens in a new tab)</span>
          </a>.
        </aside>
      </div>
    </Layout>
  )
}
