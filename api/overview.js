import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  const { date } = req.query;
  try {
    const result = await pool.query(
      `SELECT sector_norm, bullish_score, bearish_score, 
              avg_change_pct AS momentum_pct, avg_volspike
         FROM sector_overview
        WHERE as_of_date = $1
     ORDER BY bullish_score DESC`,
      [date]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("OVERVIEW ERROR:", err);
    res.status(500).json({ error: "failed to fetch overview" });
  }
}
