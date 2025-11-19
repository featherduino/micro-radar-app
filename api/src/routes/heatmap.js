const router = require("express").Router();
const db = require("../db");

router.get("/heatmap", async (req, res) => {
  const { date } = req.query;

  if (!date) return res.status(400).json({ error: "date is required" });

  try {
    const rows = await db.query(
      `SELECT 
          sector_norm, 
          score, 
          rsi, 
          change_pct, 
          volspike
       FROM sector_heatmap
       WHERE as_of_date = $1`,
      [date]
    );
    res.json(rows);
  } catch (err) {
    console.error("HEATMAP ERROR:", err);
    res.status(500).json({ error: "failed to fetch heatmap" });
  }
});

module.exports = router;
