import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';
import { Home } from '@/pages/home';
import { BibleLandingPage } from '@/pages/bible-landing';
import { BibleReaderPage } from '@/pages/bible-reader';
import { BibleSavedPage } from '@/pages/bible-saved';
import { XPChooserPage } from '@/pages/xp-chooser';
import { XPPage } from '@/pages/xp-page';
import { ExploreArticlesPage } from '@/pages/explore-articles';
import { GoFurtherPage } from '@/pages/gf/index';
import { GFBookPage } from '@/pages/gf/book';
import { GFReadingPage } from '@/pages/gf/reading';
import { RewatchPage } from '@/pages/rewatch';
import { MessagePage } from '@/pages/message';
import { ArticlePlaceholder } from '@/pages/article-placeholder';
import { getArticleBySlug } from '@/data/article-library';
import { getGFBook } from '@/data/go-further-library';

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
  
  // Extract robust page titles for routing
  let title = 'Follow Jesus Online';
  let description = 'Take your next step in following Jesus.';

  if (pathname === '/bible/saved') {
    title = 'Saved Bible Items | Follow Jesus Online';
    description = 'Reopen your locally saved Bible bookmarks, highlights, and notes.';
  } else if (pathname.startsWith('/bible/')) {
    const routeReference = decodeURIComponent(pathname.replace(/^\/bible\//, '').replace('/', ' '));
    title = `${routeReference} NET Bible | Follow Jesus Online`;
    description = `Read ${routeReference} in the NET Bible with Follow Jesus Online.`;
  } else if (pathname === '/bible') {
    title = 'Read the NET Bible | Follow Jesus Online';
    description = 'Read the NET Bible online and explore Scripture.';
  } else if (pathname.startsWith('/xp/')) {
    title = 'Next Steps | Follow Jesus Online';
    description = 'Find clear, steady next steps for walking with Jesus.';
  } else if (pathname === '/xp-pages') {
    title = 'Where Did You Start? | Follow Jesus Online';
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
      const reading = book?.readings.find((item) => item.slug === parts[2]);
      const readingSlug = parts[2];
      title = `${reading?.title ?? readingSlug.replace(/-/g, ' ')} | Go Further`;
      description = reading?.desc ?? 'A Go Further reading from Follow Jesus Online.';
    }
  } else if (pathname.startsWith('/adv-') || pathname.startsWith('/deeper-') || pathname.startsWith('/more-')) {
    const article = getArticleBySlug(pathname.slice(1));
    if (article) {
      title = `${article.title} | Follow Jesus Online`;
      description = article.excerpt;
    }
  } else if (pathname === '/rewatch' || pathname === '/rewatch-video') {
    title = 'How God Sees You Now | Follow Jesus Online';
  } else if (pathname === '/message') {
    title = 'Send a Message | Follow Jesus Online';
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

    // Apply noindex globally for all routes
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex,nofollow');

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const canonicalPath = pathname === '/rewatch-video'
      ? '/rewatch'
      : pathname === '/gf'
        ? '/gf/'
        : pathname;
    canonical?.setAttribute('href', `${siteUrl}${canonicalPath}`);
  }, [description, pathname, title]);

  return null;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <PageMetadata />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/xp-pages" component={XPChooserPage} />
        <Route path="/xp/:type" component={XPPage} />
        <Route path="/explore-articles" component={ExploreArticlesPage} />
        <Route path="/gf" component={GoFurtherPage} />
        <Route path="/gf/:slug" component={GFBookPage} />
        <Route path="/gf/:bookSlug/:readingSlug" component={GFReadingPage} />
        <Route path="/rewatch" component={RewatchPage} />
        <Route path="/rewatch-video" component={RewatchPage} />
        <Route path="/message" component={MessagePage} />
        <Route path="/bible" component={BibleLandingPage} />
        <Route path="/bible/saved" component={BibleSavedPage} />
        <Route path="/bible/:book/:chapter" component={BibleReaderPage} />
        
        {/* Unpublished Article Routes */}
        <Route path="/:slug" component={ArticlePlaceholder} />
        
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
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