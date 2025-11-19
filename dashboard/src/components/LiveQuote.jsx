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
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 8,
          }}
        >
          <Stat label="Symbol" value={quote.info?.symbol || quote.metadata?.symbol} />
          <Stat label="Industry" value={quote.info?.industry || quote.metadata?.industry} />
          <Stat label="Last Price" value={fmt(quote.priceInfo?.lastPrice)} />
          <Stat
            label="Change (%)"
            value={
              quote.priceInfo?.pChange != null
                ? `${fmt(quote.priceInfo?.change)} (${fmt(quote.priceInfo?.pChange)}%)`
                : fmt(quote.priceInfo?.change)
            }
          />
          <Stat label="Open" value={fmt(quote.priceInfo?.open)} />
          <Stat label="Day High" value={fmt(quote.priceInfo?.intraDayHighLow?.max)} />
          <Stat label="Day Low" value={fmt(quote.priceInfo?.intraDayHighLow?.min)} />
          <Stat label="Prev Close" value={fmt(quote.priceInfo?.prevClose)} />
          <Stat label="52W High" value={fmt(quote.priceInfo?.weekHighLow?.max)} />
          <Stat label="52W Low" value={fmt(quote.priceInfo?.weekHighLow?.min)} />
          <Stat label="Volume" value={fmt(quote.priceInfo?.totalTradedVolume)} />
          <Stat label="Value (₹)" value={fmt(quote.priceInfo?.totalTradedValue)} />
          <Stat label="VWAP" value={fmt(quote.priceInfo?.vwap)} />
          <Stat label="Upper Circuit" value={fmt(quote.priceInfo?.upperCP)} />
          <Stat label="Lower Circuit" value={fmt(quote.priceInfo?.lowerCP)} />
          <Stat label="Updated" value={quote.priceInfo?.lastUpdateTime || "—"} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        padding: 10,
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 600, color: "#0f172a" }}>{value ?? "—"}</div>
    </div>
  );
}

function fmt(val) {
  if (val == null) return "—";
  if (typeof val === "number") {
    if (Math.abs(val) >= 1000) {
      return val.toLocaleString("en-IN");
    }
    return val.toFixed(2);
  }
  return val;
}
