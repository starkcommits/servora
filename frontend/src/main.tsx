import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FrappeProvider } from 'frappe-react-sdk';
import { CartProvider } from './context/CartContext';
import { App } from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 3, // 3 minutes
    },
  },
});

// If accessed at /frontend (Frappe backend router), keep all sub-routes under /frontend
const getBasename = () => {
  const pathname = window.location.pathname;
  if (pathname.startsWith('/frontend')) {
    return '/frontend';
  }
  return '';
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FrappeProvider socketPort="9000">
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename={getBasename()}>
          <CartProvider>
            <App />
          </CartProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </FrappeProvider>
  </React.StrictMode>
);
