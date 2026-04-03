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
        let { deviceId, lat, lng, alert } = req.body;

        console.log("📦", deviceId, lat, lng, alert);

        // 🔥 normalize boolean
        alert = alert === true || alert === "true";

        const now = new Date();

        // 🟡 HANDLE GPS
        const validGPS = !(lat === 0 && lng === 0);

        // ✅ 1. ALWAYS UPDATE DEVICE (live tracking)
        if (validGPS) {
            const device = await deviceService.upsertDevice({
                deviceId,
                lat,
                lng,
                lastSeen: now
            });

            // 📡 real-time location (NO DB load on frontend)
            io.emit("location-update", device);
        }

        // 🚨 2. HANDLE ALERT (HIGH PRIORITY)
        if (alert) {
            console.log("🚨 ALERT");

            await Emergency.create({
                deviceId,
                lat,
                lng
            });

            io.emit("emergency-alert", {
                deviceId,
                lat,
                lng
            });

            return res.send("ALERT SAVED");
        }

        // 🧭 3. GEOFENCE (only if GPS valid)
        if (validGPS) {
            const dist = getDistance(
                lat,
                lng,
                SAFE_ZONE.lat,
                SAFE_ZONE.lng
            );

            if (dist > SAFE_ZONE.radius) {
                console.log("🚨 GEOFENCE");

                await Emergency.create({
                    deviceId,
                    lat,
                    lng,
                    type: "GEOFENCE"
                });

                io.emit("emergency-alert", {
                    deviceId,
                    lat,
                    lng,
                    type: "GEOFENCE"
                });
            }
        }

        res.send("OK");

    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).send("Error");
    }
};