import { Link, useRoute } from "wouter";
import { Layout } from "@/components/layout";
import { ChevronLabel } from "@/components/navigation-chevrons";
import NotFound from "@/pages/not-found";
import {
  KNOW_JESUS,
  XP_TOP_TEN,
  XP_TOP_TEN_CLOSING,
  getXPIntroduction,
} from "@/data/xp-next-steps";

const backLinkClass =
  "inline-flex min-h-11 items-center rounded-md px-1 -mx-1 text-sm font-semibold text-warm-700 transition-colors hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warm-700";

const rowLinkClass =
  "group flex min-h-12 items-center rounded-lg px-3 py-2.5 text-base font-semibold leading-snug text-navy transition-colors hover:bg-warm-50 focus-visible:bg-warm-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-warm-700 sm:text-[1.05rem]";

function Shell({ children, testId }: { children: React.ReactNode; testId: string }) {
  return (
    <Layout>
      <div data-testid={testId} className="mx-auto w-full max-w-2xl px-5 py-6 text-navy sm:px-8 md:py-9">
        {children}
      </div>
    </Layout>
  );
}

export function XPIntroductionPage() {
  const [match, params] = useRoute("/xp/:type/top10");
  const type = params?.type ?? "";
  const intro = match ? getXPIntroduction(type) : undefined;
  if (!intro) return <NotFound />;

  const knowHref = `/xp/know-Jesus?${new URLSearchParams({ journey: type }).toString()}`;

  return (
    <Shell testId="xp-introduction-page">
      <Link href={`/xp/${type}`} className={backLinkClass} data-testid="link-back-xp">
        <ChevronLabel text="Back" direction="left" />
      </Link>
      <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl" data-testid="text-intro-title">
        {intro.title}
      </h1>
      <div className="mt-2 h-1 w-14 rounded-full bg-warm-accent" aria-hidden="true" />
      <div className="mt-4 space-y-3 text-base leading-relaxed sm:text-lg">
        {intro.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <section aria-labelledby="xp-questions-heading" className="mt-7">
        <h2 id="xp-questions-heading" className="mb-2 text-xl font-bold sm:text-2xl">
          Questions You May Be Asking
        </h2>
        <ol className="divide-y divide-warm-200 rounded-xl border border-warm-200 bg-card">
          {XP_TOP_TEN.map((q, i) => (
            <li key={q.href}>
              <Link
                href={q.href === "/xp/know-Jesus" ? knowHref : q.href}
                className={rowLinkClass}
                data-testid={`link-question-${i + 1}`}
              >
                <span className="mr-3 w-6 shrink-0 text-right text-sm font-bold tabular-nums text-warm-700">{i + 1}</span>
                <ChevronLabel text={q.title} />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-6 text-base leading-relaxed sm:text-lg" data-testid="text-intro-closing">
        {XP_TOP_TEN_CLOSING}
      </p>
    </Shell>
  );
}

export function KnowJesusPage() {
  const journey = typeof window === "undefined"
    ? null
    : new URLSearchParams(window.location.search).get("journey");
  const validJourney = journey && getXPIntroduction(journey) ? journey : null;
  const back = validJourney
    ? { href: `/xp/${validJourney}/top10`, label: "Back to questions" }
    : { href: "/xp-pages", label: "Back to next steps" };

  return (
    <Shell testId="know-jesus-page">
      <Link href={back.href} className={backLinkClass} data-testid="link-back-know-jesus">
        <ChevronLabel text={back.label} direction="left" />
      </Link>
      <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">{KNOW_JESUS.title}</h1>
      <div className="mt-2 h-1 w-14 rounded-full bg-warm-accent" aria-hidden="true" />
      <p className="mt-4 text-base leading-relaxed sm:text-lg">{KNOW_JESUS.introduction}</p>
      <p className="mt-3 text-base font-semibold sm:text-lg">{KNOW_JESUS.lead}</p>

      <div className="mt-5 space-y-4">
        {KNOW_JESUS.sections.map((s, i) => (
          <section key={s.title} className="rounded-xl border border-warm-200 border-l-4 border-l-warm-700 bg-card px-4 py-4 sm:px-5">
            <h2 className="text-lg font-bold sm:text-xl">
              <span className="mr-2 text-warm-700 tabular-nums">{i + 1}.</span>{s.title}
            </h2>
            <p className="mt-1.5 text-base leading-relaxed">{s.text}</p>
            <ul className="mt-2">
              {s.links.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className={`${rowLinkClass} -mx-3`} data-testid={`link-resource-${l.href.replace(/[^a-z0-9]+/gi, "-")}`}>
                    <ChevronLabel text={l.title} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-6 space-y-3 text-base leading-relaxed sm:text-lg">
        {KNOW_JESUS.closing.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </Shell>
  );
}
