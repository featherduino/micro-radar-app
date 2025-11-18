const router = require("express").Router();
const db = require("../db");

router.get("/overview", async (req, res) => {
  const { date } = req.query;

  if (!date) return res.status(400).json({ error: "date is required" });

  try {
    const rows = await db.query(
      `SELECT sector_norm, bullish_score, bearish_score,
              avg_change_pct AS momentum_pct, avg_volspike
         FROM sector_overview
        WHERE as_of_date = $1
     ORDER BY bullish_score DESC`,
      [date]
    );
    res.json(rows);
  } catch (err) {
    console.error("OVERVIEW ERROR:", err);
    res.status(500).json({ error: "failed to fetch overview" });
  }
});

module.exports = router;
