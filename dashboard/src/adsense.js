// Falls back to provided publisher ID if env is not set.
const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || "ca-pub-1584617173868246";

let scriptRequested = false;

export function initAdsense() {
  if (!clientId || typeof document === "undefined" || scriptRequested) return;
  scriptRequested = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

export function pushAd() {
  if (!clientId || typeof window === "undefined") return;
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (err) {
    // Swallow errors from ad rendering to avoid impacting the app.
    console.warn("AdSense push error", err);
  }
}
