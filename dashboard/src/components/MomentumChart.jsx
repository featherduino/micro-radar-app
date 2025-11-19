// src/components/MomentumChart.jsx
import { Scatter } from "react-chartjs-2";
import { Chart } from "chart.js/auto";
import { useRef } from "react";

// Generate distinct colors
function generateColor(i) {
  const colors = [
    "#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b",
    "#e377c2","#7f7f7f","#bcbd22","#17becf","#4daf4a","#984ea3",
    "#ff7f00","#a65628","#f781bf","#999999"
  ];
  return colors[i % colors.length];
}

export default function MomentumChart({ overview, onSectorClick }) {
  const chartRef = useRef(null);

  if (!overview || overview.length === 0) return null;

  // Filter valid rows
  const valid = overview.filter(
    (r) =>
      !isNaN(Number(r.momentum_pct)) &&
      !isNaN(Number(r.bullish_score))
  );

  if (valid.length === 0) return null;

  // Compute quadrant mid points
  const midX =
    valid.reduce((a, r) => a + Number(r.momentum_pct), 0) / valid.length;

  const midY =
    valid.reduce((a, r) => a + Number(r.bullish_score), 0) / valid.length;

  // Group data by sector
  const grouped = {};
  overview.forEach((row) => {
    const sector = row.sector_norm;
    if (!grouped[sector]) grouped[sector] = [];

    grouped[sector].push({
      x: Number(row.momentum_pct),
      y: Number(row.bullish_score),
      raw: row,
    });
  });

  const datasets = Object.keys(grouped).map((sector, i) => ({
    label: sector,
    data: grouped[sector],
    backgroundColor: generateColor(i),
    borderColor: generateColor(i),
    pointRadius: 6,
    pointHoverRadius: 10,
  }));

  const data = { datasets };

  const options = {
    responsive: true,
    interaction: {
      mode: "nearest",
      intersect: true
    },
    plugins: {
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (ctx) {
            const r = ctx.raw.raw;
            return [
              `Sector: ${r.sector_norm}`,
              `Bullish Score: ${Number(r.bullish_score).toFixed(2)}`,
              `Momentum %: ${Number(r.momentum_pct).toFixed(2)}`,
              r.rsi ? `RSI: ${Number(r.rsi).toFixed(2)}` : null,
              r.avg_volspike
                ? `Vol Spike: ${Number(r.avg_volspike).toFixed(2)}`
                : null,
            ].filter(Boolean);
          },
        },
      },
      legend: { position: "top", labels: { usePointStyle: true } },
    },
    scales: {
      x: { title: { display: true, text: "Momentum (%)" }, beginAtZero: false },
      y: { title: { display: true, text: "Bullish Score" }, beginAtZero: false },
    },
    onClick: (evt) => {
      const chart = chartRef.current;
      if (!chart) return;

      const points = chart.getElementsAtEventForMode(
        evt,
        "nearest",
        { intersect: true },
        true
      );

      if (points.length > 0) {
        const datasetIndex = points[0].datasetIndex;
        const index = points[0].index;

        const dataPoint = datasets[datasetIndex].data[index].raw;

        console.log("CLICKED SECTOR:", dataPoint.sector_norm);

        if (onSectorClick) onSectorClick(dataPoint);
      }
    },
  };

  return (
    <div
      style={{
        height: 420,
        marginTop: 20,
        position: "relative",
        maxWidth: 1200,
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <Scatter ref={chartRef} data={data} options={options} />
    </div>
  );
}
