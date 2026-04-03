const deviceService = require("../services/device.service");
const { io } = require("../sockets/socket");
const { getDistance } = require("../utils/distance");

const SAFE_ZONE = {
    lat: 28.677,
    lng: 77.501,
    radius: 200 // meters
};

exports.receiveData = async (req, res) => {
    try {
        console.log("🔥 DEVICE API HIT");
        console.log("📦 Incoming Data:", req.body);

        let { deviceId, lat, lng, alert } = req.body;

        let data = {
            deviceId,
            lat,
            lng,
            alert,
            lastSeen: new Date(),
            isOnline: true
        };

        // 🚨 1. ALWAYS HANDLE ALERT FIRST (IMPORTANT FIX)
        if (alert) {
            console.log("🚨 EMERGENCY ALERT RECEIVED");

            // even if GPS = 0, still save
            const device = await deviceService.upsertDevice(data);

            io.emit("emergency-alert", device);

            return res.send("ALERT SAVED");
        }

        // 🟡 2. GPS VALIDATION (ONLY FOR NORMAL TRACKING)
        if (lat === 0 && lng === 0) {
            console.log("⚠️ GPS NOT READY");
            return res.send("GPS not ready");
        }

        // ✅ 3. SAVE NORMAL DATA
        const device = await deviceService.upsertDevice(data);

        console.log("💾 Saved Device:", device.deviceId);

        // 📡 4. REAL-TIME LOCATION UPDATE
        io.emit("location-update", device);

        // 🧭 5. GEOFENCE LOGIC (CLEAR)
        const dist = getDistance(
            lat,
            lng,
            SAFE_ZONE.lat,
            SAFE_ZONE.lng
        );

        console.log("📏 Distance from safe zone:", dist);

        if (dist > SAFE_ZONE.radius) {
            console.log("🚨 GEOFENCE BREACH");

            io.emit("emergency-alert", {
                ...device._doc,
                alertType: "GEOFENCE"
            });
        }

        res.send("OK");

    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).send("Error");
    }
};