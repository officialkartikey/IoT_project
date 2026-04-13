const deviceService = require("../services/device.service");
const Emergency = require("../models/emergency.model");
const Geofence = require("../models/Geofence"); // 1. Import your new Geofence model
const { getIO } = require("../sockets/socket");
const { getDistance } = require("../utils/distance");

exports.receiveData = async (req, res) => {
    try {
        console.log("\n================ NEW REQUEST ================");
        let { deviceId, lat, lng, alert } = req.body;

        // 🔥 BULLETPROOF ALERT PARSE
        alert = (alert === true || alert === "true" || alert === 1 || alert === "1");
        const io = getIO();
        const now = new Date();

        // 🟡 GPS VALIDATION
        const validGPS = !(lat === 0 && lng === 0);

        // ✅ 1. LIVE TRACKING
        if (validGPS) {
            await deviceService.upsertDevice({
                deviceId,
                lat,
                lng,
                lastSeen: now
            });

            io.emit("location-update", { deviceId, lat, lng, lastSeen: now });
        }

        // 🚨 2. SOS ALERT HANDLING
        if (alert) {
            await Emergency.create({ deviceId, lat, lng, type: "SOS" });
            io.emit("emergency-alert", { deviceId, lat, lng, type: "SOS" });
            return res.send("ALERT SAVED");
        }

        // 🧭 3. DYNAMIC GEOFENCE (The Updated Part)
        if (validGPS) {
            // 2. Fetch the ACTIVE fence from the database instead of using a hardcoded variable
            const activeFence = await Geofence.findOne({ isActive: true });

            if (activeFence) {
                const dist = getDistance(
                    lat,
                    lng,
                    activeFence.latitude, // Use DB values
                    activeFence.longitude // Use DB values
                );

                console.log(`📏 Distance from ${activeFence.name}:`, dist);

                // 3. Compare distance with the DYNAMIC radius from DB
                if (dist > activeFence.radius) {
                    console.log(`🚨 GEOFENCE BREACH: Outside ${activeFence.name}`);

                    try {
                        await Emergency.create({
                            deviceId,
                            lat,
                            lng,
                            type: "GEOFENCE",
                            locationName: activeFence.name // Optional: track which fence was breached
                        });
                    } catch (err) {
                        console.error("❌ GEOFENCE SAVE FAILED:", err);
                    }

                    io.emit("emergency-alert", {
                        deviceId,
                        lat,
                        lng,
                        type: "GEOFENCE",
                        locationName: activeFence.name
                    });
                }
            } else {
                console.log("ℹ️ No active geofence set in database.");
            }
        }

        res.send("OK");
    } catch (err) {
        console.error("❌ FATAL ERROR:", err);
        res.status(500).send("Error");
    }
};