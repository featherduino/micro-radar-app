require("dotenv").config();
const express = require("express");
const cors = require("cors");

const health = require("./src/routes/health");
const dates = require("./src/routes/dates");
const overview = require("./src/routes/overview");
const heatmap = require("./src/routes/heatmap");
const topSymbols = require("./src/routes/topSymbols");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", health);
app.use("/api", dates);
app.use("/api", overview);
app.use("/api", heatmap);
app.use("/api", topSymbols);

const port = process.env.PORT || 5010;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
