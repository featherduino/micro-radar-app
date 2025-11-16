const router = require("express").Router();
const { query } = require("../db");

router.get("/health", async (req, res) => {
  try {
    const rows = await query("SELECT NOW()");
    res.json({ ok: true, now: rows[0].now });
  } catch (err) {
    res.status(500).json({ ok: false });
  }
});

module.exports = router;
