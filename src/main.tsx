import '@vitejs/plugin-react/preamble';
import {createRoot} from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (Capacitor.isNativePlatform()) {
    const hadController = !!navigator.serviceWorker.controller;
    Promise.all([
      navigator.serviceWorker.getRegistrations().then((regs) =>
        Promise.all(regs.map((r) => r.unregister()))
      ),
      'caches' in window
        ? caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        : Promise.resolve(),
    ])
      .then(() => {
        if (hadController && !sessionStorage.getItem('digipet_sw_purged')) {
          sessionStorage.setItem('digipet_sw_purged', '1');
          window.location.reload();
        }
      })
      .catch(() => {});
  } else if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
