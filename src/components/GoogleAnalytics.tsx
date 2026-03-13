import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const GoogleAnalytics: React.FC = () => {
  const location = useLocation();
  const measurementId = (import.meta as any).env.VITE_GA_MEASUREMENT_ID;

  useEffect(() => {
    if (!measurementId) return;

    // Load the GA script if it hasn't been loaded yet
    if (!document.getElementById('ga-script')) {
      const script = document.createElement('script');
      script.id = 'ga-script';
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head.appendChild(script);

      const inlineScript = document.createElement('script');
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}', { send_page_view: false });
      `;
      document.head.appendChild(inlineScript);
    }
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId || !window.gtag) return;
    
    // Send pageview on route change
    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
    });
  }, [location, measurementId]);

  return null;
};

// Add TypeScript definition for window.gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}
