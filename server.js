require("dotenv").config();

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");

const Device = require("./models/Device");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

/* ================== DB CONNECT ================== */
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

/* ================== API ================== */

// Device sends data here
app.post("/device-data", async (req, res) => {
    try {
        const { deviceId, lat, lng, alert, battery, gps } = req.body;

        const data = {
            deviceId,
            lat,
            lng,
            alert,
            battery,
            gps,
            lastSeen: new Date(),
            isOnline: true
        };

        // Save / Update device
        await Device.findOneAndUpdate(
            { deviceId },
            data,
            { upsert: true }
        );

        // Send live update to app
        io.emit("location-update", data);

        // Alert handling
        if (alert) {
            io.emit("emergency-alert", data);
            console.log("🚨 EMERGENCY ALERT:", deviceId);
        }

        res.send("OK");

    } catch (err) {
        console.error(err);
        res.status(500).send("Error");
    }
});

/* ================== GET LAST LOCATION ================== */

app.get("/last-location/:deviceId", async (req, res) => {
    const device = await Device.findOne({ deviceId: req.params.deviceId });

    if (!device) return res.status(404).send("Not found");

    res.json(device);
});

/* ================== OFFLINE DETECTION ================== */

setInterval(async () => {
    const now = new Date();

    const devices = await Device.find();

    for (let d of devices) {
        const diff = (now - d.lastSeen) / 1000;

        if (diff > 30 && d.isOnline) {
            d.isOnline = false;
            await d.save();

            io.emit("device-offline", {
                deviceId: d.deviceId,
                lat: d.lat,
                lng: d.lng
            });

            console.log("❌ Device Offline:", d.deviceId);
        }
    }
}, 10000);

/* ================== SOCKET ================== */

io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);
});

/* ================== START ================== */

server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});