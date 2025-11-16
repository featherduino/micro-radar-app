const router = require("express").Router();
const { query } = require("../db");

router.get("/overview", async (req, res) => {
  const { date } = req.query;
  try {
    const rows = await query(
      `SELECT sector_norm, bullish_score, bearish_score, 
              avg_change_pct AS momentum_pct, avg_volspike
         FROM sector_overview
        WHERE as_of_date = $1
     ORDER BY bullish_score DESC`,
      [date]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "failed to fetch overview" });
  }
});

module.exports = router;
