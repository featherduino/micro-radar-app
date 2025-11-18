const express = require("express");
const cors = require("cors");

// load route handlers (they export router objects)
const health = require("./health");
const dates = require("./dates");
const overview = require("./overview");
const heatmap = require("./heatmap");
const topSymbols = require("./topSymbols");

const app = express();
app.use(cors());
app.use(express.json());

// mount routes
app.use("/api", health);
app.use("/api", dates);
app.use("/api", overview);
app.use("/api", heatmap);
app.use("/api", topSymbols);

// required for Vercel (NO app.listen)
module.exports = app;
