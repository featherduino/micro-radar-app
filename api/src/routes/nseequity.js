const express = require("express");
const { NseIndia } = require("stock-nse-india");

const router = express.Router();
const nse = new NseIndia();

/**
 * Returns latest NSE quote(s) for one or more symbols.
 * Query:
 *   - symbol=SBIN            (single)
 *   - symbols=SBIN,RELIANCE  (multiple)
 */
router.get("/nse/quote", async (req, res) => {
  const listParam = req.query.symbols || req.query.symbol;
  if (!listParam) {
    return res.status(400).json({ error: "symbol is required" });
  }

  const symbols = listParam
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  if (!symbols.length) {
    return res.status(400).json({ error: "symbol is required" });
  }

  try {
    const results = await Promise.all(
      symbols.map(async (sym) => {
        const details = await nse.getEquityDetails(sym);
        const price = details.priceInfo || {};
        const info = details.info || details.metadata || {};

        return {
          symbol: info.symbol || sym,
          industry: info.industry || null,
          lastPrice: price.lastPrice || null,
          change: price.change || null,
          pChange: price.pChange || null,
          open: price.open || null,
          dayHigh: price.intraDayHighLow?.max || null,
          dayLow: price.intraDayHighLow?.min || null,
          prevClose: price.prevClose || null,
          volume: price.totalTradedVolume || null,
          lastUpdateTime: price.lastUpdateTime || null,
        };
      })
    );

    return res.json(symbols.length === 1 ? results[0] : results);
  } catch (err) {
    console.error("Failed to fetch NSE quote", err.message || err);
    return res.status(500).json({ error: "failed to fetch live quote" });
  }
});

module.exports = router;
