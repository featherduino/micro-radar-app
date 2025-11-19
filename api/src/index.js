const express = require("express");
const cors = require("cors");

const health = require("./routes/health");
const dates = require("./routes/dates");
const overview = require("./routes/overview");
const heatmap = require("./routes/heatmap");
const topSymbols = require("./routes/topSymbols");
const nseequity = require("./routes/nseequity");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", health);
app.use("/api", dates);
app.use("/api", overview);
app.use("/api", heatmap);
app.use("/api", topSymbols);
app.use("/api", nseequity);

// required for Render / Railway
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

module.exports = app;
