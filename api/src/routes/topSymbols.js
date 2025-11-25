const router = require("express").Router();
const db = require("../db");

router.get("/top-symbols", async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "date is required" });

  try {
    const result = await db.query(
      `SELECT *
       FROM top_symbols
       WHERE as_of_date = $1
       ORDER BY score DESC
       LIMIT 25`,
      [date]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("TOP SYMBOLS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch top symbols" });
  }
});

module.exports = router;
