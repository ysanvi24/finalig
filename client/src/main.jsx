// ── Sentry MUST initialize before any React imports ──
import { initSentry } from './lib/sentry'
initSentry();
import Sentry from './lib/sentry'

import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './mobile-optimizations.css'
// Restored original App
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary'
import { ThemeProvider } from './context/ThemeContext'
import { initPerformanceMonitoring } from './utils/performance'

// Enable performance monitoring in production
if (import.meta.env.PROD) {
  initPerformanceMonitoring();
}

// ── Global crash safety net ──
// Catches unhandled promise rejections and runtime errors that escape React's ErrorBoundary
// Now also reported to Sentry for production tracking
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Global] Unhandled promise rejection:', event.reason);
  Sentry.captureException(event.reason || new Error('Unhandled Promise Rejection'));
  // Prevent the default browser error overlay in production
  if (import.meta.env.PROD) event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.error('[Global] Uncaught error:', event.error || event.message);
  Sentry.captureException(event.error || new Error(event.message || 'Unknown global error'));
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <div className="min-h-screen pt-safe-top pb-safe-bottom">
          <App />
        </div>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
