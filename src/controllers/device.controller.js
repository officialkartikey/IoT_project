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

        // 🔥 FIX 1: Ensure boolean
        alert = alert === true || alert === "true";

        // 🔥 FIX 2: Get existing device
        const existing = await deviceService.getDevice(deviceId);

        // 🔥 FIX 3: Prevent alert overwrite
        if (existing?.alert === true && alert === false) {
            alert = true;
        }

        let data = {
            deviceId,
            lat,
            lng,
            alert,
            lastSeen: new Date(),
            isOnline: true
        };

        // 🚨 1. HANDLE ALERT FIRST (NEVER SKIP)
        if (alert) {
            console.log("🚨 EMERGENCY ALERT RECEIVED");

            const device = await deviceService.upsertDevice(data);

            console.log("💾 Saved Device (ALERT):", device.deviceId, device.alert);

            io.emit("emergency-alert", device);

            return res.send("ALERT SAVED");
        }

        // 🟡 2. GPS VALIDATION (ONLY FOR NORMAL DATA)
        if (lat === 0 && lng === 0) {
            console.log("⚠️ GPS NOT READY");
            return res.send("GPS not ready");
        }

        // ✅ 3. SAVE NORMAL LOCATION
        const device = await deviceService.upsertDevice(data);

        console.log("💾 Saved Device:", device.deviceId, "Alert:", device.alert);

        // 📡 4. REAL-TIME LOCATION UPDATE
        io.emit("location-update", device);

        // 🧭 5. GEOFENCE LOGIC
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