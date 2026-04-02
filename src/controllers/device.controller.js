const deviceService = require("../services/device.service");
const { io } = require("../sockets/socket");
const { getDistance } = require("../utils/distance");

const SAFE_ZONE = {
    lat: 28.677,
    lng: 77.501,
    radius: 200
};

exports.receiveData = async (req, res) => {
    try {
        console.log("🔥 DEVICE API HIT");
        console.log("📦 Incoming Data:", req.body);

        const data = {
            ...req.body,
            lastSeen: new Date(),
            isOnline: true
        };

        // 🚨 Skip invalid GPS
        if (data.lat === 0 && data.lng === 0) {
            console.log("⚠️ GPS NOT READY");
            return res.send("GPS not ready");
        }

        const device = await deviceService.upsertDevice(data);

        console.log("💾 Saved Device:", device.deviceId);

        // 📡 Real-time update
        io.emit("location-update", device);

        // 🚨 Alert / Geofence
        const dist = getDistance(
            data.lat,
            data.lng,
            SAFE_ZONE.lat,
            SAFE_ZONE.lng
        );

        if (dist > SAFE_ZONE.radius || data.alert) {
            console.log("🚨 EMERGENCY TRIGGERED");
            io.emit("emergency-alert", device);
        }

        res.send("OK");

    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).send("Error");
    }
};