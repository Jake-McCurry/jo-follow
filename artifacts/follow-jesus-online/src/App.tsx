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
import { XPChooserPage } from '@/pages/xp-chooser';
import { XPPage } from '@/pages/xp-page';
import { ExploreArticlesPage } from '@/pages/explore-articles';
import { RewatchPage } from '@/pages/rewatch';
import { MessagePage } from '@/pages/message';
import { ArticlePlaceholder } from '@/pages/article-placeholder';

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
  
  // Extract robust page titles for routing
  let title = 'Follow Jesus Online';
  let description = 'Take your next step in following Jesus.';

  if (location.startsWith('/bible/')) {
    const routeReference = decodeURIComponent(location.replace(/^\/bible\//, '').replace('/', ' '));
    title = `${routeReference} NET Bible | Follow Jesus Online`;
    description = `Read ${routeReference} in the NET Bible with Follow Jesus Online.`;
  } else if (location === '/bible') {
    title = 'Read the NET Bible | Follow Jesus Online';
    description = 'Read the NET Bible online and explore Scripture.';
  } else if (location.startsWith('/xp/')) {
    title = 'Next Steps | Follow Jesus Online';
    description = 'Find clear, steady next steps for walking with Jesus.';
  } else if (location === '/xp-pages') {
    title = 'Where Did You Start? | Follow Jesus Online';
  } else if (location === '/explore-articles') {
    title = 'Explore Articles | Follow Jesus Online';
    description = 'Resources and guides to help you understand your faith.';
  } else if (location.startsWith('/adv-') || location.startsWith('/deeper-') || location.startsWith('/more-')) {
    title = 'Guide | Follow Jesus Online';
  } else if (location === '/rewatch' || location === '/rewatch-video') {
    title = 'How God Sees You Now | Follow Jesus Online';
  } else if (location === '/message') {
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
    canonical?.setAttribute('href', `${siteUrl}${location === '/rewatch-video' ? '/rewatch' : location}`);
  }, [description, location, title]);

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
        <Route path="/rewatch" component={RewatchPage} />
        <Route path="/rewatch-video" component={RewatchPage} />
        <Route path="/message" component={MessagePage} />
        <Route path="/bible" component={BibleLandingPage} />
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