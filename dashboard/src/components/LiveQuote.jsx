import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

export default function LiveQuote({ symbols }) {
  const [selected, setSelected] = useState("");
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const symbolOptions = useMemo(() => {
    if (!symbols) return [];
    const uniq = new Set();
    symbols.forEach((s) => {
      if (s.symbol) uniq.add(s.symbol);
    });
    return Array.from(uniq);
  }, [symbols]);

  useEffect(() => {
    if (!selected && symbolOptions.length) {
      setSelected(symbolOptions[0]);
    }
  }, [symbolOptions, selected]);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .get(`/nse/quote?symbol=${encodeURIComponent(selected)}`)
      .then((res) => {
        if (cancelled) return;
        setQuote(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        setQuote(null);
        setError(err?.message || "Failed to load live quote");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selected, refreshKey]);

  return (
    <div style={{ marginTop: 32, padding: 20, borderRadius: 12, background: "#f3f4f6" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>📡 Live NSE Quote</h2>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          style={{ padding: 8, minWidth: 160 }}
          disabled={!symbolOptions.length}
        >
          {!symbolOptions.length && <option value="">No symbols loaded</option>}
          {symbolOptions.map((sym) => (
            <option key={sym} value={sym}>
              {sym}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setRefreshKey((n) => n + 1)}
          disabled={!selected || loading}
          style={{ padding: "8px 14px", cursor: loading ? "default" : "pointer" }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}

      {quote && (
        <div style={{ marginTop: 12, lineHeight: 1.5 }}>
          <div>
            <strong>{quote.symbol}</strong> {quote.industry ? `· ${quote.industry}` : ""}
          </div>
          <div>
            Last: {quote.lastPrice ?? "—"} ({quote.change ?? "—"} / {quote.pChange ?? "—"}%)
          </div>
          <div>
            O:{quote.open ?? "—"} H:{quote.dayHigh ?? "—"} L:{quote.dayLow ?? "—"} Prev Close:
            {quote.prevClose ?? "—"}
          </div>
          <div>Volume: {quote.volume ?? "—"}</div>
          <div>Updated: {quote.lastUpdateTime || "—"}</div>
        </div>
      )}
    </div>
  );
}
