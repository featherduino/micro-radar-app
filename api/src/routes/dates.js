const router = require("express").Router();
const { query } = require("../db");

router.get("/dates", async (req, res) => {
  try {
    const rows = await query(
      `SELECT DISTINCT to_char(as_of_date, 'YYYY-MM-DD') AS as_of_date
         FROM sector_overview
     ORDER BY as_of_date DESC
        LIMIT 30`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch dates" });
  }
});



module.exports = router;
