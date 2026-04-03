const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const deviceRoutes = require("./routes/device.routes");
const emergencyRoutes = require("./routes/emergency.routes");
const contactRoutes = require("./routes/contact.routes");


const app = express();

app.use(cors());
app.use(express.json());
app.get("/test", (req, res) => {
    console.log("✅ TEST ROUTE HIT");
    res.send("TEST OK");
});
app.use((req, res, next) => {
    console.log("🌍", req.method, req.url);
    next();
});


app.use("/api/contact", contactRoutes);


app.use("/api/emergency", emergencyRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/device", deviceRoutes);

module.exports = app;