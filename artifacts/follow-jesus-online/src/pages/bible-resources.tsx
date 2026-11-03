import { useMemo, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { AlertCircle, Download, Info } from "lucide-react";
import { Layout } from "@/components/layout";
import { ChevronLabel } from "@/components/navigation-chevrons";
import { ResourceMarkdown } from "@/components/bible-resources/resource-markdown";
import {
  assetUrl, buildLinkMap, canonicalBookFromTitle, numericChapters, useResourceArticle, useResourceCatalog,
  type ResourceCollection,
} from "@/lib/bible-resources";

const SURVEY_IDS = ["survey-ot", "survey-nt"];
const GOSPEL_IDS = ["discover-jesus", "hearing-god"];

function Shell({ back, children }: { back: { href: string; label: string }; children: ReactNode }) {
  return (
    <Layout>
      <div className="resources-page mx-auto w-full max-w-3xl px-5 py-6 sm:px-8 md:py-10">
        <Link href={back.href} className="back-link" data-testid="link-back">
          <ChevronLabel text={back.label} direction="left" />
        </Link>
        {children}
      </div>
    </Layout>
  );
}

function Skeleton() {
  return (
    <div className="mt-8 space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-2/3 animate-pulse rounded bg-warm-100" />
      {[0, 1, 2, 3].map((i) => <div key={i} className="h-4 animate-pulse rounded bg-warm-100/80" style={{ width: `${92 - i * 9}%` }} />)}
    </div>
  );
}

function ErrorState({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div className="mt-8 rounded-xl border border-destructive/30 bg-card p-6 text-center" role="alert">
      <AlertCircle className="mx-auto mb-3 h-8 w-8 text-destructive" />
      <p className="mb-4 font-medium text-foreground">{message}</p>
      <button type="button" onClick={retry} className="min-h-11 rounded-md bg-navy px-5 font-semibold text-warm-50 hover:opacity-90" data-testid="button-retry">
        Try again
      </button>
    </div>
  );
}

function Row({ href, title, description, children, testId }: { href: string; title: string; description?: string; children?: ReactNode; testId: string }) {
  return (
    <li className="resource-row">
      <Link href={href} className="resource-row__link" data-testid={testId}>
        <span className="resource-row__title"><ChevronLabel text={title} /></span>
        {description && <span className="resource-row__desc">{description}</span>}
      </Link>
      {children}
    </li>
  );
}

export function BibleResourcesMenuPage() {
  const { data } = useResourceCatalog();
  const promisesPath = data?.collections.find((c) => c.id === "promises-collection")?.path ?? "/bible/resources/promises-collection";
  return (
    <Shell back={{ href: "/bible", label: "Bible Reader" }}>
      <header className="mb-6 mt-5">
        <p className="eyebrow">Study the Bible</p>
        <h1 className="resource-title">Bible Resources</h1>
      </header>
      <ul className="resource-list">
        <Row href="/knowing-god" title="Knowing God / Topical Bible" description="A biblical guide to the nature and character of God" testId="link-resource-knowing-god" />
        <Row href={promisesPath} title="Promises of God" description="Discover promises for your situation, feelings, and relationships" testId="link-resource-promises" />
        <Row href="/bible/resources/study-methods" title="Bible Study Methods" description="R.E.C.A.P. Method, Topical Study Method, Inductive Study Method" testId="link-resource-study-methods" />
        <Row href="/bible/resources/gospels" title="Gospel Devotionals" description="Discover Jesus in the Gospels and Hearing the Voice of God" testId="link-resource-gospels">
          <ul className="sublinks">
            <li><Link href="/bible/resources/discover-jesus" data-testid="link-resource-discover-jesus">Discover Jesus in the Gospels</Link></li>
            <li><Link href="/bible/resources/hearing-god" data-testid="link-resource-hearing-god">Hearing the Voice of God</Link></li>
          </ul>
        </Row>
        <Row href="/bible/resources/survey" title="Survey of the Bible" description="An overview of the books of the Bible by Joshua Nations" testId="link-resource-survey" />
        <Row href="/bible" title="Read the Bible Online" description="See the New English Translation and the King James Version" testId="link-resource-read" />
      </ul>
    </Shell>
  );
}

function GroupPage({ title, eyebrow, ids, testPrefix }: { title: string; eyebrow: string; ids: string[]; testPrefix: string }) {
  const { data, isLoading, error, refetch } = useResourceCatalog();
  const cols = ids.map((id) => data?.collections.find((c) => c.id === id)).filter(Boolean) as ResourceCollection[];
  return (
    <Shell back={{ href: "/bible/resources", label: "Bible Resources" }}>
      <header className="mb-6 mt-5"><p className="eyebrow">{eyebrow}</p><h1 className="resource-title">{title}</h1></header>
      {isLoading ? <Skeleton /> : error ? <ErrorState message="We couldn't open the resource library." retry={() => refetch()} /> : (
        <ul className="resource-list">
          {cols.map((c) => <Row key={c.id} href={c.path} title={c.title} description={c.description || `${c.items.length} lessons`} testId={`link-${testPrefix}-${c.id}`} />)}
        </ul>
      )}
    </Shell>
  );
}

export const BibleResourcesSurveyPage = () => <GroupPage title="Survey of the Bible" eyebrow="By Joshua Nations" ids={SURVEY_IDS} testPrefix="survey" />;
export const BibleResourcesGospelsPage = () => <GroupPage title="Gospel Devotionals" eyebrow="Devotionals" ids={GOSPEL_IDS} testPrefix="gospels" />;

const parentOf = (c: ResourceCollection) =>
  SURVEY_IDS.includes(c.id) ? { href: "/bible/resources/survey", label: "Survey of the Bible" }
    : GOSPEL_IDS.includes(c.id) ? { href: "/bible/resources/gospels", label: "Gospel Devotionals" }
      : { href: "/bible/resources", label: "Bible Resources" };

const trimSlash = (p: string) => p.replace(/\/+$/, "") || "/";

/** Resolves both collection pages and article pages from catalog paths. */
export function BibleResourcesPathPage() {
  const [location] = useLocation();
  const pathname = trimSlash(location.split("?")[0]);
  const catalog = useResourceCatalog();
  const found = useMemo(() => {
    for (const c of catalog.data?.collections ?? []) {
      if (trimSlash(c.path) === pathname) return { collection: c, index: -1 };
      const index = c.items.findIndex((i) => !!i.path && trimSlash(i.path) === pathname);
      if (index >= 0) return { collection: c, index };
    }
    return null;
  }, [catalog.data, pathname]);

  if (catalog.isLoading) return <Shell back={{ href: "/bible/resources", label: "Bible Resources" }}><Skeleton /></Shell>;
  if (catalog.error) return <Shell back={{ href: "/bible/resources", label: "Bible Resources" }}><ErrorState message="We couldn't open the resource library." retry={() => catalog.refetch()} /></Shell>;
  if (!found) {
    return (
      <Shell back={{ href: "/bible/resources", label: "Bible Resources" }}>
        <div className="mt-10 text-center"><h1 className="resource-title">Resource not found</h1><p className="mt-3 text-muted-foreground">This page isn't in the Bible Resources library.</p></div>
      </Shell>
    );
  }
  return found.index < 0 ? <CollectionView collection={found.collection} /> : <ArticleView collection={found.collection} index={found.index} />;
}

function CollectionView({ collection }: { collection: ResourceCollection }) {
  const survey = collection.id.startsWith("survey");
  return (
    <Shell back={parentOf(collection)}>
      <header className="mb-6 mt-5">
        <p className="eyebrow">{collection.items.length} entries · {new Set(collection.items.filter(item => item.status === "imported").map(item => item.id)).size} available articles</p>
        <h1 className="resource-title">{collection.title}</h1>
        {collection.description && <p className="mt-2 text-muted-foreground">{collection.description}</p>}
      </header>
      {collection.id === "promises-collection" && (
        <Link href="/promises" className="promises-callout" data-testid="link-promises-reader">
          <span className="font-serif text-lg font-bold text-navy">God’s Promises for Hope</span>
          <span className="text-sm text-muted-foreground">Study promises for your situation, feelings, relationships, identity and future.</span>
          <ChevronLabel text="Open the Promises reader" className="text-sm font-semibold text-warm-700" />
        </Link>
      )}
      {collection.items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-warm-300 p-6 text-center text-muted-foreground">No articles have been imported for this collection yet.</p>
      ) : (
        <ol className={survey ? "resource-list resource-list--compact" : "resource-list"}>
          {collection.items.map((item, index) => item.status === "imported" && item.path ? (
            <Row key={`${item.id}-${index}`} href={item.path} title={item.title} testId={`link-article-${item.id}`} />
          ) : (
            <li key={`${item.id}-${index}`} className="resource-row resource-row--missing" data-testid={`status-missing-${item.id}`}>
              <span className="resource-row__title text-muted-foreground">{item.title}</span>
              <span className="resource-row__desc">{item.status === "coming-soon" ? "Coming soon" : item.status === "blocked" ? "Awaiting a source export" : "Not available from the source"}</span>
            </li>
          ))}
        </ol>
      )}
    </Shell>
  );
}

function ArticleView({ collection, index }: { collection: ResourceCollection; index: number }) {
  const item = collection.items[index];
  const catalog = useResourceCatalog();
  const links = useMemo(() => buildLinkMap(catalog.data), [catalog.data]);
  const article = useResourceArticle(item.status === "imported" ? item.id : undefined);
  const survey = collection.id.startsWith("survey");
  const book = article.data?.issues.length ? null : canonicalBookFromTitle(item.title, collection.id);
  const seenArticleIds = new Set<string>();
  const imported = collection.items.map((it, i) => ({ it, i })).filter(({ it }) => {
    if (it.status !== "imported" || !it.path || seenArticleIds.has(it.id)) return false;
    seenArticleIds.add(it.id);
    return true;
  }) as { it: ResourceCollection["items"][number] & { path: string }; i: number }[];
  const pos = imported.findIndex(({ i }) => i === index);
  const prev = pos > 0 ? imported[pos - 1].it : null;
  const next = pos >= 0 && pos < imported.length - 1 ? imported[pos + 1].it : null;
  const pdfPath = article.data?.pdf.status === "available" ? article.data.pdf.path ?? item.pdfPath : undefined;
  const issues = [...new Set([...(item.issue ? [item.issue] : []), ...(article.data?.issues ?? [])])];

  return (
    <Shell back={{ href: collection.path, label: collection.title }}>
      {item.status !== "imported" ? (
        <div className="mt-8"><h1 className="resource-title">{item.title}</h1><p className="mt-3 text-muted-foreground">This article isn't available in the local library yet.</p></div>
      ) : article.isLoading ? <Skeleton /> : article.error || !article.data ? (
        <ErrorState message="We couldn't open this article." retry={() => article.refetch()} />
      ) : (
        <article className="mt-5">
          <header className="mb-6 border-b border-warm-200 pb-5">
            <p className="eyebrow">{collection.title}</p>
            <h1 className="resource-title">{survey ? numericChapters(article.data.title) : article.data.title}</h1>
            {pdfPath && (
              <a href={assetUrl(pdfPath)} download className="pdf-link" data-testid="link-pdf">
                <Download className="h-4 w-4" /> Download PDF
              </a>
            )}
          </header>
          <ResourceMarkdown markdown={article.data.markdown} book={book} links={links} survey={survey} />
          {issues.length > 0 && (
            <aside className="source-notice" data-testid="text-source-issues">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <div><p className="font-semibold">Source note</p><ul>{issues.map((t) => <li key={t}>{t}</li>)}</ul></div>
            </aside>
          )}
        </article>
      )}
      <nav className="article-pager" aria-label="Article navigation">
        {prev ? <Link href={prev.path} className="pager-link" data-testid="link-prev"><span className="pager-label">Previous</span><ChevronLabel text={prev.title} direction="left" /></Link> : <span />}
        {next ? <Link href={next.path} className="pager-link pager-link--next" data-testid="link-next"><span className="pager-label">Next</span><ChevronLabel text={next.title} /></Link> : <span />}
      </nav>
    </Shell>
  );
}
