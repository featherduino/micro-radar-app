const router = require("express").Router();
const db = require("../db");

router.get("/overview", async (req, res) => {
  const { date } = req.query;

  if (!date) return res.status(400).json({ error: "date is required" });

  try {
    const result = await db.query(
      `SELECT *
       FROM sector_overview
       WHERE as_of_date = $1`,
      [date]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("OVERVIEW ERROR:", err);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
});

module.exports = router;
