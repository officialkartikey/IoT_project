const deviceService = require("../services/device.service");
const Emergency = require("../models/emergency.model");
const { getIO } = require("../sockets/socket");
const { getDistance } = require("../utils/distance");

const SAFE_ZONE = {
    lat:  26.251099,
    lng:  78.172611,
    radius: 200
};

exports.receiveData = async (req, res) => {
    try {
        console.log("\n================ NEW REQUEST ================");

        let { deviceId, lat, lng, alert } = req.body;

        console.log("📦 RAW DATA:", req.body);

        // 🔥 BULLETPROOF ALERT PARSE
        const rawAlert = alert;
        alert = (
            alert === true ||
            alert === "true" ||
            alert === 1 ||
            alert === "1"
        );

        console.log("🔥 RAW ALERT:", rawAlert);
        console.log("🔥 FINAL ALERT:", alert);

        const io = getIO(); // ✅ correct way

        const now = new Date();

        // 🟡 GPS VALIDATION
        const validGPS = !(lat === 0 && lng === 0);
        console.log("📍 GPS VALID:", validGPS);

        let device;

        // ✅ 1. LIVE TRACKING
        if (validGPS) {
            console.log("💾 Updating device location...");

            device = await deviceService.upsertDevice({
                deviceId,
                lat,
                lng,
                lastSeen: now
            });

            console.log("✅ Device Updated:", device);

            // 📡 SEND CLEAN DATA TO FRONTEND
            io.emit("location-update", {
                deviceId: device.deviceId,
                lat: device.lat,
                lng: device.lng,
                lastSeen: device.lastSeen
            });
        } else {
            console.log("⚠️ GPS NOT VALID - skipping location update");
        }

        // 🚨 2. ALERT HANDLING
        if (alert) {
            console.log("🚨 ALERT TRIGGERED");

            try {
                const saved = await Emergency.create({
                    deviceId,
                    lat,
                    lng,
                    type: "SOS"
                });

                console.log("✅ EMERGENCY SAVED:", saved);

            } catch (err) {
                console.error("❌ EMERGENCY SAVE FAILED:", err);
            }

            io.emit("emergency-alert", {
                deviceId,
                lat,
                lng,
                type: "SOS"
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

        console.log("✅ REQUEST COMPLETE\n");

        res.send("OK");

    } catch (err) {
        console.error("❌ FATAL ERROR:", err);
        res.status(500).send("Error");
    }
};