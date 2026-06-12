import { useEffect } from 'react';

/** Carga Plausible/Umami si VITE_ANALYTICS_DOMAIN está definido en build. */
export function useOptionalAnalytics() {
  useEffect(() => {
    const domain = import.meta.env.VITE_ANALYTICS_DOMAIN?.trim();
    if (!domain || document.querySelector('script[data-fmc-analytics]')) return;

    const script = document.createElement('script');
    script.defer = true;
    script.dataset.fmcAnalytics = '1';
    script.dataset.domain = domain;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }, []);
}
