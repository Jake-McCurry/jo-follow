import { createRoot } from 'react-dom/client';

import App, { preloadInitialPage } from './App';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

const render = () => createRoot(document.getElementById('root')!, {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);

// Prepare only the requested section, not the whole site. React then paints its
// real layout once instead of rendering a temporary page and restarting animations.
preloadInitialPage(window.location.pathname)
  .catch(error => console.error('Initial page could not be prepared', error))
  .finally(render);
