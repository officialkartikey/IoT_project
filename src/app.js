const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const deviceRoutes = require("./routes/device.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/device", deviceRoutes);

module.exports = app;