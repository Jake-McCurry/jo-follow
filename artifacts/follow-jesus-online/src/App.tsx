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
import { BibleReaderPage } from '@/pages/bible-reader';

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
  const isReader = location.startsWith('/bible/');
  const routeReference = isReader
    ? decodeURIComponent(location.replace(/^\/bible\//, '').replace('/', ' '))
    : null;
  const title = routeReference
    ? `${routeReference} NET Bible | Follow Jesus Online`
    : 'NET Bible Reader | Follow Jesus Online';
  const description = routeReference
    ? `Read ${routeReference} in the NET Bible with Follow Jesus Online.`
    : 'Read the NET Bible online and take your next step in following Jesus.';

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

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    canonical?.setAttribute('href', `${siteUrl}${location}`);
  }, [description, location, title]);

  return null;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <PageMetadata />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/bible/:book/:chapter" component={BibleReaderPage} />
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