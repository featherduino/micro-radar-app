import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function DatePicker({ value, onChange }) {
  const [dates, setDates] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    api.get("/dates").then((res) => {
      const normalized = (res.data || []).map((r) => ({
        as_of_date:
          typeof r.as_of_date === "string"
            ? r.as_of_date
            : r.as_of_date instanceof Date
            ? r.as_of_date.toISOString().slice(0, 10)
            : String(r.as_of_date).slice(0, 10),
      }));

      setDates(normalized);

      // Only set default ONCE
      if (!initialized && normalized.length > 0) {
        onChange(normalized[0].as_of_date);
        setInitialized(true);
      }
    });
  }, []);

  return (
    <div style={{ marginBottom: 20 }}>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{ padding: 10, fontSize: 16 }}
      >
        {dates.map((d) => (
          <option key={d.as_of_date} value={d.as_of_date}>
            {d.as_of_date}
          </option>
        ))}
      </select>
    </div>
  );
}
