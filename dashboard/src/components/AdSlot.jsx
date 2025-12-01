import { useEffect, useRef } from "react";
import { initAdsense, pushAd } from "../adsense";

export default function AdSlot({ slot, format = "auto", layout = "responsive", style = {} }) {
  const ref = useRef(null);
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

  useEffect(() => {
    initAdsense();
  }, []);

  useEffect(() => {
    if (!ref.current || !clientId || !slot) return;
    // Slight delay so the script can attach before pushing.
    const id = window.setTimeout(() => pushAd(), 100);
    return () => window.clearTimeout(id);
  }, [clientId, slot]);

  if (!clientId || !slot) return null;

  return (
    <div style={{ margin: "24px 0", display: "flex", justifyContent: "center" }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block", minWidth: 320, minHeight: 100, ...style }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={layout === "responsive" ? "true" : "false"}
        ref={ref}
      />
    </div>
  );
}
