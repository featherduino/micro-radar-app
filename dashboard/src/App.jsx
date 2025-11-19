import { useEffect, useState } from "react";
import DatePicker from "./components/DatePicker";
import OverviewCards from "./components/Overview";
import MomentumChart from "./components/MomentumChart";
import Heatmap from "./components/HeatMap";
import TopSymbols from "./components/TopSymbols";
import LiveQuote from "./components/LiveQuote";
import { api } from "./api/client";
import "./chart-setup";

export default function App() {
  const [date, setDate] = useState(null);
  const [overview, setOverview] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [symbols, setSymbols] = useState(null);

  useEffect(() => {
    if (!date) return;

    api.get(`/overview?date=${date}`).then((res) => setOverview(res.data));
    api.get(`/heatmap?date=${date}`).then((res) => setHeatmap(res.data));
    api.get(`/top-symbols?date=${date}`).then((res) => setSymbols(res.data));
  }, [date]);

  return (
    <div style={{ padding: 40, fontFamily: "Inter, sans-serif" }}>
      <h1>📊 Macro Radar Dashboard</h1>

      <DatePicker value={date} onChange={setDate} />

      <OverviewCards overview={overview} />
      <MomentumChart
        overview={overview}
        onSectorClick={(s) => {
          console.log("CLICKED:", s);
          alert(`Sector clicked: ${s.sector_norm}`);
        }}
      />
      <Heatmap heatmap={heatmap} />
      <TopSymbols symbols={symbols} />
      <LiveQuote symbols={symbols || []} />
    </div>
  );
}
