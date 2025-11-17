import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  const { date } = req.query;
  try {
    const result = await pool.query(
      `SELECT sector_norm, symbol, sentiment,
              score, change_pct, volspike, rsi
         FROM top_symbols
        WHERE as_of_date = $1
     ORDER BY score DESC
        LIMIT 50`,
      [date]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("TOP SYMBOLS ERROR:", err);
    res.status(500).json({ error: "failed to load top symbols" });
  }
}
