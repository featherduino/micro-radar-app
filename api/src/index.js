// src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const health = require("./routes/health");
const dates = require("./routes/dates");
const overview = require("./routes/overview");
const heatmap = require("./routes/heatmap");
const topSymbols = require("./routes/topSymbols");
const nseequity = require("./routes/nseequity");
const reports = require("./routes/reports");
const n8nChatProxy = require("./routes/n8nChatProxy");
const docs = require("./routes/docs");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", health);
app.use("/api", dates);
app.use("/api", overview);
app.use("/api", heatmap);
app.use("/api", topSymbols);
app.use("/api", nseequity);
app.use("/api", reports);
app.use("/api", n8nChatProxy);
app.use("/api", docs);
app.get("/privacy", (req, res) => {
  res.sendFile(__dirname + "/privacy.html");
});


const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));

module.exports = app;
