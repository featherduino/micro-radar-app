const router = require("express").Router();
const db = require("../db");

router.get("/top-symbols", async (req, res) => {
  const { date } = req.query;

  if (!date) return res.status(400).json({ error: "date is required" });

  try {
    const rows = await db.query(
      `SELECT sector_norm, symbol, sentiment,
              score, change_pct, volspike, rsi
         FROM top_symbols
        WHERE as_of_date = $1
     ORDER BY score DESC
        LIMIT 50`,
      [date]
    );
    res.json(rows);
  } catch (err) {
    console.error("TOP SYMBOLS ERROR:", err);
    res.status(500).json({ error: "failed to load top symbols" });
  }
});

module.exports = router;
