const router = require("express").Router();
const { query } = require("../db");
router.get("/heatmap", async (req, res) => {
  const date = req.query.date;

  try {
    const rows = await query(
      `SELECT sector_norm, score, rsi, change_pct, volspike
         FROM sector_heatmap
        WHERE as_of_date = $1
      ORDER BY sector_norm`,
      [date]
    );

    res.json(rows);
  } catch (err) {
    console.error("HEATMAP ERROR:", err);
    res.status(500).json({ error: "failed to load heatmap" });
  }
});

module.exports = router;
