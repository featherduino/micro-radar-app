import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  const { date } = req.query;
  try {
    const result = await pool.query(
      `SELECT sector_norm, avg_score, avg_rsi, avg_change, avg_volspike
         FROM sector_heatmap
        WHERE as_of_date = $1`,
      [date]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("HEATMAP ERROR:", err);
    res.status(500).json({ error: "failed to fetch heatmap" });
  }
}
