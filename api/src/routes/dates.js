const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/dates", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT DISTINCT 
        to_char(as_of_date, 'YYYY-MM-DD') AS as_of_date
      FROM sector_overview
      ORDER BY as_of_date DESC
      LIMIT 30
    `);

    res.json(result.rows);  // <-- FIX
  } catch (err) {
    console.error("DATES ERROR:", err);
    res.status(500).json({ error: "failed to fetch dates" });
  }
});

module.exports = router;
