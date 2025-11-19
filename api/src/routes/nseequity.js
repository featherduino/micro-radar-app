const express = require("express");
const { NseIndia } = require("stock-nse-india");

const router = express.Router();
const nse = new NseIndia();

function safe(obj, key, fallback = null) {
  if (!obj || typeof obj !== "object") return fallback;
  return obj[key] ?? fallback;
}

router.get("/nse/quote", async (req, res) => {
  const qs = req.query.symbols || req.query.symbol;
  if (!qs) return res.status(400).json({ error: "symbol is required" });

  const symbols = qs.split(",").map(s => s.trim().toUpperCase());

  try {
    const results = await Promise.all(symbols.map(async (sym) => {
      const data = await nse.getEquityDetails(sym);

      const info = data.info || {};
      const price = data.priceInfo || {};
      const meta  = data.metadata || {};
      const ind   = data.industryInfo || {};

      return {
        symbol: info.symbol || sym,
        companyName: info.companyName || meta.companyName || sym,
        industry: ind.industry || info.industry || null,
        sector: ind.sector || null,
        macro: ind.macro || null,

        lastPrice: price.lastPrice ?? null,
        change: price.change ?? null,
        pChange: price.pChange ?? null,

        open: price.open ?? null,
        dayHigh: safe(price.intraDayHighLow, "max"),
        dayLow: safe(price.intraDayHighLow, "min"),

        prevClose: price.previousClose || price.prevClose || null,
        volume: price.totalTradedVolume ?? null,
        lastUpdateTime: price.lastUpdateTime || meta.lastUpdateTime || null,

        weekHigh: safe(price.weekHighLow, "max"),
        weekLow: safe(price.weekHighLow, "min"),

        peRatio: meta.pdSymbolPe || null,
        sectorPe: meta.pdSectorPe || null,
      };
    }));

    res.json(symbols.length === 1 ? results[0] : results);
  } catch (err) {
    console.error("NSE QUOTE ERROR:", err);
    res.status(500).json({ error: "failed to fetch NSE quote" });
  }
});

module.exports = router;
