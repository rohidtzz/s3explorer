import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initCapacitor } from './native';
import './index.css';

// Fire-and-forget: Capacitor plugin init doesn't block first paint. If it
// fails (browser dev, missing plugin), we still render normally.
initCapacitor().catch(() => { /* no-op */ });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
