import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req, res) {
  try {
    const result = await pool.query("SELECT NOW()");
    res.status(200).json({ ok: true, now: result.rows[0].now });
  } catch (err) {
    console.error("HEALTH ERROR:", err);
    res.status(500).json({ ok: false });
  }
}
