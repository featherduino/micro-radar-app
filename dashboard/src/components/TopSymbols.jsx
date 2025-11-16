export default function TopSymbols({ symbols }) {
  if (!symbols || symbols.length === 0) return <div>No top symbols</div>;

  return (
    <div style={{ marginTop: 40 }}>
      <h2>🚀 Top Symbols</h2>
      <table border="1" cellPadding="10" style={{ width: "100%", fontSize: 14 }}>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Sector</th>
            <th>Sentiment</th>
            <th>Score</th>
            <th>Change %</th>
            <th>RSI</th>
            <th>Vol Spike</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((s, idx) => (
            <tr key={`${s.symbol}-${idx}`}>
              <td>{s.symbol}</td>
              <td>{s.sector_norm}</td>
              <td>{s.sentiment}</td>
              <td>{Number(s.score) || 0}</td>
              <td>{Number(s.change_pct).toFixed(2)}</td>
              <td>{Number(s.rsi).toFixed(2)}</td>
              <td>{Number(s.volspike)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
