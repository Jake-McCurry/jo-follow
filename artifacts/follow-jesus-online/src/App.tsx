import { type ReactNode, Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { lazyPage as lazy } from '@/lib/lazy-page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  useParams,
  Router as WouterRouter,
} from 'wouter';
import { Home } from '@/pages/home';
import { getXPIntroduction, KNOW_JESUS } from '@/data/xp-next-steps';
import { knowingGodIntroductions } from '@/data/knowingGodIntroductions';
import { getArticlePath, getArticleSlugFromPath } from '@/data/article-routing';
import { getGFBook } from '@/data/go-further-library';
import { Layout } from '@/components/layout';

// Keep the homepage immediate; load all other reading surfaces on demand.
const ConnectWithGodPage = lazy(() => import('@/pages/connect-with-god').then(m => ({ default: m.ConnectWithGodPage })));
const BibleLandingPage = lazy(() => import('@/pages/bible-landing').then(m => ({ default: m.BibleLandingPage })));
const BibleReaderPage = lazy(() => import('@/pages/bible-reader').then(m => ({ default: m.BibleReaderPage })));
const BibleSavedPage = lazy(() => import('@/pages/bible-saved').then(m => ({ default: m.BibleSavedPage })));
const BibleResourcesMenuPage = lazy(() => import('@/pages/bible-resources').then(m => ({ default: m.BibleResourcesMenuPage })));
const BibleResourcesSurveyPage = lazy(() => import('@/pages/bible-resources').then(m => ({ default: m.BibleResourcesSurveyPage })));
const BibleResourcesGospelsPage = lazy(() => import('@/pages/bible-resources').then(m => ({ default: m.BibleResourcesGospelsPage })));
const BibleResourcesPathPage = lazy(() => import('@/pages/bible-resources').then(m => ({ default: m.BibleResourcesPathPage })));
const XPChooserPage = lazy(() => import('@/pages/xp-chooser').then(m => ({ default: m.XPChooserPage })));
const XPPage = lazy(() => import('@/pages/xp-page').then(m => ({ default: m.XPPage })));
const XPIntroductionPage = lazy(() => import('@/pages/xp-next-steps').then(m => ({ default: m.XPIntroductionPage })));
const KnowJesusPage = lazy(() => import('@/pages/xp-next-steps').then(m => ({ default: m.KnowJesusPage })));
const ExploreArticlesPage = lazy(() => import('@/pages/explore-articles').then(m => ({ default: m.ExploreArticlesPage })));
const GoFurtherPage = lazy(() => import('@/pages/gf/index').then(m => ({ default: m.GoFurtherPage })));
const GFBookPage = lazy(() => import('@/pages/gf/book').then(m => ({ default: m.GFBookPage })));
const GFReadingPage = lazy(() => import('@/pages/gf/reading').then(m => ({ default: m.GFReadingPage })));
const HeartAfterGodIntroPage = lazy(() => import('@/pages/gf/heart-after-god-intro').then(m => ({ default: m.HeartAfterGodIntroPage })));
const KnowingGodPage = lazy(() => import('@/pages/knowing-god/index').then(m => ({ default: m.KnowingGodPage })));
const PromisesPage = lazy(() => import('@/pages/promises/index').then(m => ({ default: m.PromisesPage })));
const KnowingGodIntroductionIndexPage = lazy(() => import('@/pages/knowing-god/introduction').then(m => ({ default: m.KnowingGodIntroductionIndexPage })));
const KnowingGodIntroductionPage = lazy(() => import('@/pages/knowing-god/introduction').then(m => ({ default: m.KnowingGodIntroductionPage })));
const RewatchPage = lazy(() => import('@/pages/rewatch').then(m => ({ default: m.RewatchPage })));
const MessagePage = lazy(() => import('@/pages/message').then(m => ({ default: m.MessagePage })));
const TranslatePage = lazy(() => import('@/pages/translate').then(m => ({ default: m.TranslatePage })));
const ArticlePlaceholder = lazy(() => import('@/pages/article-placeholder').then(m => ({ default: m.ArticlePlaceholder })));
const AdventureIndexPage = lazy(() => import('@/pages/adv-index').then(m => ({ default: m.AdventureIndexPage })));
const AdminReactionsPage = lazy(() => import('@/pages/admin/reactions').then(m => ({ default: m.AdminReactionsPage })));

/** Avoid painting and replacing a temporary Layout on the first visit. */
export async function preloadInitialPage(pathname: string) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = base && pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : pathname;
  const pages: [RegExp, { preload: () => Promise<unknown> }][] = [
    [/^\/xp-pages\/?$/, XPChooserPage],
    [/^\/xp\/know-[Jj]esus\/?$/, KnowJesusPage],
    [/^\/xp\/[^/]+\/top10\/?$/, XPIntroductionPage],
    [/^\/xp\//, XPPage],
    [/^\/knowing-god\/introduction\/[^/]+/, KnowingGodIntroductionPage],
    [/^\/knowing-god\/introduction\/?$/, KnowingGodIntroductionIndexPage],
    [/^\/knowing-god/, KnowingGodPage],
    [/^\/promises/, PromisesPage],
    [/^\/bible\/saved/, BibleSavedPage],
    [/^\/bible\/resources\/survey\/?$/, BibleResourcesSurveyPage],
    [/^\/bible\/resources\/gospels\/?$/, BibleResourcesGospelsPage],
    [/^\/bible\/resources\/[^/]+/, BibleResourcesPathPage],
    [/^\/bible\/resources\/?$/, BibleResourcesMenuPage],
    [/^\/bible\/[^/]+\/[^/]+/, BibleReaderPage],
    [/^\/bible\/?$/, BibleLandingPage],
    [/^\/gf\/a-heart-after-god\/the-restless-heart/, HeartAfterGodIntroPage],
    [/^\/gf\/[^/]+\/[^/]+/, GFReadingPage],
    [/^\/gf\/[^/]+\/?$/, GFBookPage],
    [/^\/gf\/?$/, GoFurtherPage],
    [/^\/(?:videos|rewatch|rewatch-video)(?:\/|$)/, RewatchPage],
    [/^\/connect-with-god\/?$/, ConnectWithGodPage],
    [/^\/message\/?$/, MessagePage],
    [/^\/translate\/?$/, TranslatePage],
    [/^\/explore-articles\/?$/, ExploreArticlesPage],
    [/^\/adv1\/?$/, AdventureIndexPage],
    [/^\/admin\/reactions\/?$/, AdminReactionsPage],
    [/^\/(?:prayer|lords-prayer|experiencing-god|because|adv|deeper)(?:\/|$)|^\/(?:more-|adv-|deeper-)/, ArticlePlaceholder],
  ];
  const page = pages.find(([pattern]) => pattern.test(path))?.[1];
  if (page === ArticlePlaceholder) {
    await Promise.all([
      page.preload(),
      import('@/data/article-catalog').then(async catalog => {
        const slug = getArticleSlugFromPath(path) ?? '';
        if (catalog.getArticleBySlug(slug)) await catalog.loadArticle(slug);
      }),
    ]);
  } else if (page === BibleReaderPage) {
    await Promise.all([
      page.preload(),
      import('@/pages/bible-reader').then(reader => reader.preloadBibleRoute(path, window.location.search, queryClient)),
    ]);
  } else {
    await page?.preload();
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const siteUrl = import.meta.env.VITE_PUBLIC_SITE_URL ?? 'https://follow.jesusonline.com';

function PageMetadata() {
  const [location] = useLocation();
  const pathname = location.split('?')[0];
  const [articleMetadata, setArticleMetadata] = useState<{ path: string; title: string; excerpt: string } | null>(null);
  const isArticlePath = /^\/(?:prayer|lords-prayer|experiencing-god|because|adv|deeper)(?:\/|$)|^\/(?:adv-|deeper-|more-)/.test(pathname);

  useEffect(() => {
    if (!isArticlePath) return;
    let active = true;
    // Metadata must not pull the complete article library into every visit.
    import('@/data/article-catalog').then(({ getArticleBySlug }) => {
      const article = getArticleBySlug(getArticleSlugFromPath(pathname) ?? '');
      if (active && article) setArticleMetadata({ path: pathname, title: article.title, excerpt: article.excerpt });
    }).catch(error => console.error('Article metadata could not be loaded', error));
    return () => { active = false; };
  }, [isArticlePath, pathname]);
  
  // Extract robust page titles for routing
  let title = 'Follow Jesus Online';
  let description = 'Take your next step in following Jesus.';

  const knowingGodPath = pathname.replace(/\/$/, '');
  if (knowingGodPath === '/translate') {
    title = 'Translate · Follow Jesus Online';
    description = 'Read Follow Jesus Online in your heart language. Step-by-step instructions for translating the site with Google Translate on Chrome, Safari, Android, and any browser.';
  } else if (knowingGodPath === '/knowing-god') {
    title = 'Knowing God / Topical Bible Verses | Follow Jesus Online';
    description = 'Search and study topical Bible passages about the nature and character of God.';
  } else if (knowingGodPath === '/knowing-god/introduction') {
    title = 'Introductory Articles | Knowing God Topical Bible | Follow Jesus Online';
    description = 'Read the original introductory material and closing appendices from Knowing God before exploring the Topical Bible.';
  } else if (knowingGodPath.startsWith('/knowing-god/introduction/')) {
    const intro = knowingGodIntroductions.find((item) => item.slug === knowingGodPath.split('/')[3]);
    title = `${intro?.title ?? 'Introduction'} | Knowing God Topical Bible | Follow Jesus Online`;
    description = intro?.description ?? 'Introductory material from Knowing God.';
  } else if (knowingGodPath === '/promises') {
    title = 'God’s Promises for Hope | JO FOLLOW';
    description = 'Study God’s promises for your situation, feelings, relationships, identity, future, and God’s character.';
  } else if (pathname === '/bible/saved') {
    title = 'Saved Bible Items | Follow Jesus Online';
    description = 'Reopen your locally saved Bible bookmarks, highlights, and notes.';
  } else if (pathname.replace(/\/$/, '') === '/bible/resources') {
    title = 'Bible Resources | Follow Jesus Online';
    description = 'Study methods, devotionals, God\u2019s promises, a survey of the Bible, and topical study tools.';
  } else if (pathname.startsWith('/bible/resources/')) {
    const slug = pathname.split('/').filter(Boolean).at(-1) ?? '';
    const named = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    title = `${named} | Bible Resources | Follow Jesus Online`;
    description = 'A Bible study resource from Follow Jesus Online.';
  } else if (pathname.startsWith('/bible/')) {
    const routeReference = decodeURIComponent(pathname.replace(/^\/bible\//, '').replace('/', ' '));
    title = `${routeReference} NET Bible | Follow Jesus Online`;
    description = `Read ${routeReference} in the NET Bible with Follow Jesus Online.`;
  } else if (pathname === '/bible') {
    title = 'Read the NET Bible | Follow Jesus Online';
    description = 'Read the NET Bible online and explore Scripture.';
  } else if (pathname.replace(/\/$/, '').toLowerCase() === '/xp/know-jesus') {
    title = `${KNOW_JESUS.title} | Follow Jesus Online`;
    description = KNOW_JESUS.introduction;
  } else if (/^\/xp\/[^/]+\/top10\/?$/.test(pathname)) {
    const introduction = getXPIntroduction(pathname.split('/')[2]);
    title = `${introduction?.title ?? 'Next Steps'} | Follow Jesus Online`;
    description = introduction?.paragraphs[0] ?? 'Find clear, steady next steps for walking with Jesus.';
  } else if (pathname.startsWith('/xp/')) {
    title = 'Next Steps | Follow Jesus Online';
    description = 'Find clear, steady next steps for walking with Jesus.';
  } else if (pathname === '/videos/Gods-Vision') {
    title = 'God’s Vision | Follow Jesus Online';
    description = 'Watch how God sees you now and read the complete God’s Vision transcript.';
  } else if (knowingGodPath === '/adv1') {
    title = 'The Adventure of Living with Jesus | Follow Jesus Online';
    description = 'Ten short guide chapters for your first steps with Jesus, from Begin the Adventure to Continuing with Jesus.';
  } else if (pathname === '/xp-pages') {
    title = 'Where Did You Start? | Follow Jesus Online';
  } else if (pathname === '/connect-with-god') {
    title = 'Connect with God | Follow Jesus Online';
    description = 'Explore prayer, Scripture and resources for walking with God throughout your day.';
  } else if (pathname === '/explore-articles') {
    title = 'Explore Articles | Follow Jesus Online';
    description = 'Resources and guides to help you understand your faith.';
  } else if (pathname === '/gf' || pathname === '/gf/') {
    title = 'Go Further | Follow Jesus Online';
    description = 'The short guide showed you the path. These books walk it with you for a longer stretch.';
  } else if (pathname.startsWith('/gf/')) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length === 2) {
      // /gf/:book
      const bookSlug = parts[1];
      const book = getGFBook(bookSlug);
      title = `${book?.title ?? bookSlug.replace(/-/g, ' ')} | Go Further`;
      description = book?.desc ?? 'Discipleship readings from Follow Jesus Online.';
    } else if (parts.length === 3) {
      // /gf/:book/:reading
      const book = getGFBook(parts[1]);
       const reading = book?.readings.find((item) => item.slug === parts[2]) ??
         (book?.introChapter?.slug === parts[2] ? book.introChapter : undefined);
      const readingSlug = parts[2];
      title = `${reading?.title ?? readingSlug.replace(/-/g, ' ')} | Go Further`;
      description = reading?.desc ?? 'A Go Further reading from Follow Jesus Online.';
    }
  } else if (
    pathname === '/prayer' ||
    pathname.startsWith('/prayer/') ||
    pathname === '/lords-prayer' ||
    pathname.startsWith('/lords-prayer/') ||
    pathname === '/experiencing-god' ||
    pathname.startsWith('/experiencing-god/') ||
    pathname.startsWith('/because/') ||
    pathname.startsWith('/adv/') ||
    pathname.startsWith('/deeper/') ||
    pathname.startsWith('/adv-') ||
    pathname.startsWith('/deeper-') ||
    pathname.startsWith('/more-')
  ) {
    const article = articleMetadata?.path === pathname ? articleMetadata : null;
    if (article) {
      title = `${article.title} | Follow Jesus Online`;
      description = article.excerpt;
    }
  } else if (pathname === '/videos' || pathname === '/rewatch' || pathname === '/rewatch-video') {
    title = 'Watch the Videos | Follow Jesus Online';
    description = 'Watch Jesus’ Resurrection and You, The Gift of Heaven, God’s Vision, Personal Transformation, and Eternal Impact.';
  } else if (pathname === '/message') {
    title = 'Send a Message | Follow Jesus Online';
  } else if (pathname === '/admin/reactions') {
    title = 'Reaction Report | Follow Jesus Online';
    description = 'Private article reaction report.';
  }

  useEffect(() => {
    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute('content', description);

    // Keep pages out of search results while allowing crawlers to follow links.
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex,follow');

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const articleSlug = getArticleSlugFromPath(pathname);
    const canonicalPath = pathname === '/rewatch-video' || pathname === '/videos'
      ? '/rewatch'
      : pathname === '/gf'
        ? '/gf/'
        : isArticlePath && articleSlug
          ? getArticlePath(articleSlug)
          : pathname;
    canonical?.setAttribute('href', `${siteUrl}${canonicalPath}`);
  }, [description, isArticlePath, pathname, title]);

  return null;
}

function ScrollToTopOnNavigation() {
  const [location] = useLocation();
  const pathname = location.split('?')[0];

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    // Explicit anchors, such as Bible verse links, should still reach their target.
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return null;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <PageMetadata />
      <ScrollToTopOnNavigation />
      <Suspense fallback={<Layout trackHistory={false}><div className="mx-auto max-w-4xl px-6 py-12" role="status">Loading page…</div></Layout>}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/xp-pages" component={XPChooserPage} />
        <Route path="/xp/:type/top10" component={XPIntroductionPage} />
        <Route path="/xp/know-Jesus" component={KnowJesusPage} />
        <Route path="/xp/know-jesus" component={KnowJesusPage} />
        <Route path="/xp/:type" component={XPPage} />
        <Route path="/explore-articles" component={ExploreArticlesPage} />
        <Route path="/gf" component={GoFurtherPage} />
        <Route path="/gf/:slug" component={GFBookPage} />
        <Route path="/gf/a-heart-after-god/the-restless-heart" component={HeartAfterGodIntroPage} />
        <Route path="/gf/:bookSlug/:readingSlug" component={GFReadingPage} />
        <Route path="/knowing-god" component={KnowingGodPage} />
        <Route path="/promises" component={PromisesPage} />
        <Route path="/knowing-god/introduction" component={KnowingGodIntroductionIndexPage} />
        <Route path="/knowing-god/introduction/:section" component={KnowingGodIntroductionPage} />
        <Route path="/videos"><RewatchPage /></Route>
        <Route path="/rewatch"><RewatchPage /></Route>
        <Route path="/rewatch-video"><RewatchPage /></Route>
        <Route path="/videos/Gods-Vision">
          <RewatchPage videoId="psw_5rn9WFY" />
        </Route>
        <Route path="/message" component={MessagePage} />
        <Route path="/translate" component={TranslatePage} />
        <Route path="/connect-with-god" component={ConnectWithGodPage} />
        <Route path="/admin/reactions" component={AdminReactionsPage} />
        <Route path="/bible" component={BibleLandingPage} />
        <Route path="/bible/saved" component={BibleSavedPage} />
        <Route path="/bible/resources" component={BibleResourcesMenuPage} />
        <Route path="/bible/resources/survey" component={BibleResourcesSurveyPage} />
        <Route path="/bible/resources/gospels" component={BibleResourcesGospelsPage} />
        <Route path="/bible/resources/:collection" component={BibleResourcesPathPage} />
        <Route path="/bible/resources/:collection/:article" component={BibleResourcesPathPage} />
        <Route path="/bible/:book/:chapter" component={BibleReaderPage} />
        <Route path="/prayer" component={ArticlePlaceholder} />
        <Route path="/prayer/:slug" component={ArticlePlaceholder} />
        <Route path="/lords-prayer" component={ArticlePlaceholder} />
        <Route path="/lords-prayer/:slug" component={ArticlePlaceholder} />
        <Route path="/experiencing-god" component={ArticlePlaceholder} />
        <Route path="/experiencing-god/:slug" component={ArticlePlaceholder} />
        <Route path="/because/:slug" component={ArticlePlaceholder} />
        <Route path="/adv1" component={AdventureIndexPage} />
        <Route path="/adv/:slug" component={ArticlePlaceholder} />
        <Route path="/deeper/:slug" component={ArticlePlaceholder} />
        
        <Route path="/:slug" component={LegacyArticleRoute} />
        
        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </RoutedErrorBoundary>
  );
}

function LegacyArticleRoute() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const canonicalPath = getArticlePath(slug);

  useEffect(() => {
    if (canonicalPath !== `/${slug}`) {
      setLocation(`${canonicalPath}${window.location.search}`, { replace: true });
    }
  }, [canonicalPath, setLocation, slug]);

  return canonicalPath === `/${slug}` ? <ArticlePlaceholder /> : null;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;