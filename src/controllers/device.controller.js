const deviceService = require("../services/device.service");
const Emergency = require("../models/emergency.model");
const { io } = require("../sockets/socket");
const { getDistance } = require("../utils/distance");

const SAFE_ZONE = {
    lat: 28.677,
    lng: 77.501,
    radius: 200
};

exports.receiveData = async (req, res) => {
    try {
        console.log("\n================ NEW REQUEST ================");
        
        let { deviceId, lat, lng, alert } = req.body;

        console.log("📦 RAW DATA:", req.body);

        // 🔥 normalize boolean
        alert = alert === true || alert === "true";
        console.log("🔍 Parsed Alert:", alert, "| Type:", typeof alert);

        const now = new Date();

        // 🟡 HANDLE GPS
        const validGPS = !(lat === 0 && lng === 0);
        console.log("📍 GPS VALID:", validGPS);

        // ✅ 1. UPDATE DEVICE
        if (validGPS) {
            console.log("💾 Updating device location...");

            const device = await deviceService.upsertDevice({
                deviceId,
                lat,
                lng,
                lastSeen: now
            });

            console.log("✅ Device Updated:", device);

            io.emit("location-update", device);
        } else {
            console.log("⚠️ GPS NOT VALID - Skipping location update");
        }

        // 🚨 2. HANDLE ALERT
        if (alert) {
            console.log("🚨 ALERT TRIGGERED");

            try {
                console.log("🔥 Attempting to save emergency...");

                const saved = await Emergency.create({
                    deviceId,
                    lat,
                    lng
                });

                console.log("✅ EMERGENCY SAVED:", saved);

            } catch (err) {
                console.error("❌ EMERGENCY SAVE FAILED:", err);
            }

            io.emit("emergency-alert", {
                deviceId,
                lat,
                lng
            });

            console.log("📡 Alert emitted to frontend");

            return res.send("ALERT SAVED");
        }

        // 🧭 3. GEOFENCE
        if (validGPS) {
            const dist = getDistance(
                lat,
                lng,
                SAFE_ZONE.lat,
                SAFE_ZONE.lng
            );

            console.log("📏 Distance from safe zone:", dist);

            if (dist > SAFE_ZONE.radius) {
                console.log("🚨 GEOFENCE BREACH");

                try {
                    const saved = await Emergency.create({
                        deviceId,
                        lat,
                        lng,
                        type: "GEOFENCE"
                    });

                    console.log("✅ GEOFENCE SAVED:", saved);

                } catch (err) {
                    console.error("❌ GEOFENCE SAVE FAILED:", err);
                }

                io.emit("emergency-alert", {
                    deviceId,
                    lat,
                    lng,
                    type: "GEOFENCE"
                });

                console.log("📡 Geofence alert emitted");
            }
        }

        console.log("✅ REQUEST COMPLETED");
        res.send("OK");

    } catch (err) {
        console.error("❌ FATAL ERROR:", err);
        res.status(500).send("Error");
    }
};