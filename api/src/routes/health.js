const router = require("express").Router();
const db = require("../db");

router.get("/health", async (req, res) => {
  try {
    const rows = await db.query("SELECT NOW()");
    res.json({ ok: true, now: rows[0].now });
  } catch (err) {
    console.error("HEALTH ERROR:", err);
    res.status(500).json({ ok: false });
  }
});

module.exports = router;
