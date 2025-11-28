const router = require("express").Router();
const db = require("../db");
const { OpenAI } = require("openai");

const openai =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== ""
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

async function ensureReportsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS market_reports (
      id SERIAL PRIMARY KEY,
      report_date DATE UNIQUE NOT NULL,
      comparison_date DATE,
      html TEXT NOT NULL,
      metadata JSONB,
      model TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
}

function getPreviousTradingDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    throw new Error("invalid date");
  }
  const day = date.getUTCDay();
  let offset = 1;
  if (day === 1) offset = 3;
  else if (day === 0) offset = 2;
  const prev = new Date(date);
  prev.setUTCDate(prev.getUTCDate() - offset);
  return prev.toISOString().slice(0, 10);
}

function buildPrompt(payload) {
  return `
You are a financial analyst generating an HTML report for the Macro Radar dashboard.
Use the JSON data below to summarize the day's move vs. the comparison date.
Keep sections: Overview paragraph, table comparing sectors, bullet news, short outlook.
Return complete HTML (doctype, head, body) with inline CSS.
Data:
${JSON.stringify(payload, null, 2)}
`;
}

async function generateReport(date) {
  if (!openai) throw new Error("OPENAI_API_KEY is not configured");

  const comparisonDate = getPreviousTradingDate(date);

  const [overviewCurrent, overviewPrev, topSymbols, heatmap] = await Promise.all([
    db.query(
      `SELECT sector_norm, bullish_score, bearish_score, avg_change_pct, avg_volspike
         FROM sector_overview WHERE as_of_date = $1`,
      [date]
    ),
    db.query(
      `SELECT sector_norm, bullish_score, bearish_score, avg_change_pct, avg_volspike
         FROM sector_overview WHERE as_of_date = $1`,
      [comparisonDate]
    ),
    db.query(
      `SELECT sector_norm, symbol, sentiment, score, change_pct, volspike, rsi
         FROM top_symbols WHERE as_of_date = $1
      ORDER BY score DESC LIMIT 25`,
      [date]
    ),
    db.query(
      `SELECT sector_norm, score, rsi, change_pct, volspike
         FROM sector_heatmap WHERE as_of_date = $1`,
      [date]
    ),
  ]);

  const payload = {
    report_date: date,
    comparison_date: comparisonDate,
    overview_current: overviewCurrent.rows,
    overview_comparison: overviewPrev.rows,
    top_symbols: topSymbols.rows,
    heatmap: heatmap.rows,
  };

  const prompt = buildPrompt(payload);

  const completion = await openai.responses.create({
    model: process.env.OPENAI_REPORT_MODEL || "gpt-4o-mini",
    input: prompt,
  });

  const html =
    completion?.output?.[0]?.content?.[0]?.text ||
    completion?.output?.[0]?.content?.[0]?.value ||
    completion?.output_text ||
    "";

  if (!html) {
    throw new Error("Report generation returned empty response");
  }

  const result = await db.query(
    `INSERT INTO market_reports (report_date, comparison_date, html, metadata, model)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (report_date)
     DO UPDATE SET comparison_date = EXCLUDED.comparison_date,
                   html = EXCLUDED.html,
                   metadata = EXCLUDED.metadata,
                   model = EXCLUDED.model,
                   created_at = NOW()
     RETURNING *`,
    [date, comparisonDate, html, payload, process.env.OPENAI_REPORT_MODEL || "gpt-4o-mini"]
  );

  return result.rows[0];
}

router.get("/reports", async (req, res) => {
  try {
    await ensureReportsTable();
    const { date } = req.query;
    if (date) {
      const result = await db.query(`SELECT * FROM market_reports WHERE report_date = $1`, [date]);
      return res.json(result.rows);
    }
    const result = await db.query(
      `SELECT * FROM market_reports ORDER BY report_date DESC LIMIT 15`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("REPORT GET ERROR:", err);
    res.status(500).json({ error: "failed to fetch reports" });
  }
});

router.post("/reports", async (req, res) => {
  try {
    const { date } = req.body || {};
    if (!date) return res.status(400).json({ error: "date is required" });

    await ensureReportsTable();
    const existing = await db.query(`SELECT * FROM market_reports WHERE report_date = $1`, [date]);
    if (existing.rows[0]) {
      return res.json(existing.rows[0]);
    }

    const report = await generateReport(date);
    res.json(report);
  } catch (err) {
    console.error("REPORT GENERATION ERROR:", err);
    res.status(500).json({ error: "failed to generate report", details: err.message });
  }
});

module.exports = router;
