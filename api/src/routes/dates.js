const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

router.get("/dates", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT to_char(as_of_date, 'YYYY-MM-DD') AS as_of_date
      FROM sector_overview
      ORDER BY as_of_date DESC
      LIMIT 30
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("DATES ERROR:", err);
    res.status(500).json({ error: "failed to fetch dates" });
  }
});

module.exports = router;
