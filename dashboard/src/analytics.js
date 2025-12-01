// Uses env override when present, otherwise falls back to provided GA tag.
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || "G-KTGPYDEGFS";

let initialized = false;

export function initAnalytics() {
  if (!measurementId || typeof document === "undefined" || initialized) return;

  // Standard GA4 snippet: queue events until the library loads.
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", measurementId);

  initialized = true;
}

export function trackPageView(pathname) {
  if (!measurementId || typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: pathname || window.location.pathname,
  });
}
