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
      .finally(() => !cancelled && setLoading(false));

    return () => (cancelled = true);
  }, [selected, refreshKey]);

  const q = quote || {};

  return (
    <div style={{ marginTop: 32, padding: 20, borderRadius: 12, background: "#f3f4f6" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2>📡 Live NSE Quote</h2>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={!symbolOptions.length}
          style={{ padding: 8, minWidth: 160 }}
        >
          {!symbolOptions.length && <option>No symbols</option>}
          {symbolOptions.map((sym) => (
            <option key={sym}>{sym}</option>
          ))}
        </select>

        <button
          onClick={() => setRefreshKey((n) => n + 1)}
          disabled={!selected || loading}
          style={{ padding: "8px 14px" }}
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {quote && (
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 8,
          }}
        >
          <Stat label="Symbol" value={q.symbol} />
          <Stat label="Company" value={q.companyName} />
          <Stat label="Industry" value={q.industry} />
          <Stat label="Sector" value={q.sector} />

          <Stat label="Last Price" value={fmt(q.lastPrice)} />
          <Stat
            label="Change (%)"
            value={
              q.pChange != null
                ? `${fmt(q.change)} (${fmt(q.pChange)}%)`
                : fmt(q.change)
            }
          />

          <Stat label="Open" value={fmt(q.open)} />
          <Stat label="Day High" value={fmt(q.dayHigh)} />
          <Stat label="Day Low" value={fmt(q.dayLow)} />
          <Stat label="Prev Close" value={fmt(q.prevClose)} />

          <Stat label="52W High" value={fmt(q.weekHigh)} />
          <Stat label="52W Low" value={fmt(q.weekLow)} />

          <Stat label="Volume" value={fmt(q.volume)} />

          <Stat label="Updated" value={q.lastUpdateTime || "—"} />
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
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value ?? "—"}</div>
    </div>
  );
}

function fmt(val) {
  if (val == null) return "—";
  if (typeof val === "number") return val.toLocaleString("en-IN");
  return val;
}
