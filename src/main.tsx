import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { BookingProvider } from './contexts/BookingContext';
import { logWebVitals } from './lib/webVitals';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <BookingProvider>
        <App />
      </BookingProvider>
    </LanguageProvider>
  </StrictMode>
);

if (import.meta.env.DEV) {
  logWebVitals();
}
