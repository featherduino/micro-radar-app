export default function OverviewCards({ overview }) {
  if (!overview || overview.length === 0) return null;

  const strongestBullish = [...overview].sort((a, b) => b.bullish_score - a.bullish_score)[0];
  const strongestBearish = [...overview].sort((a, b) => a.bearish_score - b.bearish_score)[0];
  const highestVol = [...overview].sort((a, b) => b.avg_volspike - a.avg_volspike)[0];
  const highestMomo = [...overview].sort((a, b) => b.avg_change_pct - a.avg_change_pct)[0];

  const cardStyle = {
    flex: 1,
    background: "#f9fafb",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    marginRight: 15,
  };

  return (
    <div style={{ display: "flex", marginBottom: 20 }}>
      <div style={cardStyle}>
        <h3>🔥 Strongest Bullish</h3>
        <p>{strongestBullish.sector_norm}</p>
      </div>

      <div style={cardStyle}>
        <h3>❄ Strongest Bearish</h3>
        <p>{strongestBearish.sector_norm}</p>
      </div>

      <div style={cardStyle}>
        <h3>⚡ Highest Volatility</h3>
        <p>{highestVol.sector_norm}</p>
      </div>

      <div style={cardStyle}>
        <h3>📈 Highest Momentum</h3>
        <p>{highestMomo.sector_norm}</p>
      </div>
    </div>
  );
}
