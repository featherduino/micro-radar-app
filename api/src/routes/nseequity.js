const express = require("express");
const { NseIndia } = require("stock-nse-india");

const router = express.Router();
const nse = new NseIndia();

// Safe getter
const get = (obj, path, fallback = null) => {
  try {
    return path.split(".").reduce((o, k) => (o ? o[k] : null), obj) ?? fallback;
  } catch {
    return fallback;
  }
};

router.get("/nse/quote", async (req, res) => {
  try {
    const param = req.query.symbols || req.query.symbol;
    if (!param) return res.status(400).json({ error: "symbol is required" });

    const symbols = param
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const results = await Promise.all(
      symbols.map(async (sym) => {
        const raw = await nse.getEquityDetails(sym);

        return {
          symbol: sym,
          companyName: get(raw, "info.companyName"),
          sector: get(raw, "industryInfo.sector"),
          industry: get(raw, "industryInfo.industry"),
          basicIndustry: get(raw, "industryInfo.basicIndustry"),
          macro: get(raw, "industryInfo.macro"),

          lastPrice: get(raw, "priceInfo.lastPrice"),
          change: get(raw, "priceInfo.change"),
          pChange: get(raw, "priceInfo.pChange"),
          open: get(raw, "priceInfo.open"),
          dayHigh: get(raw, "priceInfo.intraDayHighLow.max"),
          dayLow: get(raw, "priceInfo.intraDayHighLow.min"),
          prevClose: get(raw, "priceInfo.previousClose"),
          weekHigh: get(raw, "priceInfo.weekHighLow.max"),
          weekLow: get(raw, "priceInfo.weekHighLow.min"),
          volume: get(raw, "preOpenMarket.totalTradedVolume"),

          isin: get(raw, "info.isin"),
          listingDate: get(raw, "info.listingDate"),
          lastUpdateTime: get(raw, "metadata.lastUpdateTime")
        };
      })
    );

    return res.json(symbols.length === 1 ? results[0] : results);
  } catch (err) {
    console.error("NSE QUOTE ERROR:", err);
    return res.status(500).json({ error: "failed to fetch live quote" });
  }
});

module.exports = router;
