// src/components/HeatMap.jsx
import { Bar } from "react-chartjs-2";

export default function Heatmap({ heatmap }) {
  if (!heatmap || heatmap.length === 0) return null;

  const labels = heatmap.map((s) => s.sector_norm);

  const data = {
    labels,
    datasets: [
      {
        label: "Score",
        data: heatmap.map((s) => Number(s.score) || 0),
        backgroundColor: "rgba(54, 162, 235, 0.7)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "RSI",
        data: heatmap.map((s) => Number(s.rsi) || 0),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
      {
        label: "Momentum %",
        data: heatmap.map((s) => Number(s.change_pct) || 0),
        backgroundColor: "rgba(75, 192, 192, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Vol Spike",
        data: heatmap.map((s) => Number(s.volspike) || 0),
        backgroundColor: "rgba(255, 206, 86, 0.7)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: false,
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          font: { size: 11 },
        },
      },
      y: {
        beginAtZero: true,
        ticks: { font: { size: 11 } },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          pointStyle: "rectRounded",
        },
      },
    },
  };

  return (
    <div
      style={{
        height: 420,
        marginTop: 8,
        marginBottom: 32,
        maxWidth: 1200,
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto",
        background: "#fff",
        padding: 16,
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(15,23,42,0.08)",
      }}
    >
      <Bar data={data} options={options} />
    </div>
  );
}
