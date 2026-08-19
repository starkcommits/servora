import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import { FrappeProvider } from 'frappe-react-sdk';
import { CartProvider } from './context/CartContext';
import { App } from './App';
import './index.css';

// If accessed at /frontend (Frappe backend router), keep all sub-routes under /frontend
const getBasename = () => {
  const pathname = window.location.pathname;
  if (pathname.startsWith('/frontend')) {
    return '/frontend';
  }
  return '';
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // SW is served via Frappe API so it gets Service-Worker-Allowed: / header
    // allowing it to control /frontend/ scope (static /assets/ path cannot do this)
    navigator.serviceWorker.register('/api/method/servora.api.get_pwa_sw', { scope: '/frontend/' })
      .then((registration) => {
        console.log('SW registered with scope:', registration.scope);
        // Force the browser to check for a new service worker immediately
        registration.update();
      })
      .catch((error) => {
        console.error('SW registration failed:', error);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SWRConfig 
      value={{
        revalidateOnFocus: false,
        dedupingInterval: 60000,
        errorRetryCount: 1,
      }}
    >
      <FrappeProvider socketPort="9000">
        <BrowserRouter basename={getBasename()}>
          <CartProvider>
            <App />
          </CartProvider>
        </BrowserRouter>
      </FrappeProvider>
    </SWRConfig>
  </React.StrictMode>
);
