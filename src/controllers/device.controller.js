const deviceService = require("../services/device.service");
const Emergency = require("../models/emergency.model");
const Geofence = require("../models/Geofence"); 
const { getIO } = require("../sockets/socket");
const { getDistance } = require("../utils/distance");

// ... top imports remain the same

exports.receiveData = async (req, res) => {
    try {
        let {
            deviceId,
            lat,
            lng,
            alert,
            battPct,
            battMv,
            battHealth,
            battLow
        } = req.body;

        const io = getIO();
        const now = new Date();
        const validGPS = !(lat === 0 && lng === 0);

        if (validGPS) {
            const previousData = await deviceService.getDeviceById(deviceId);
            let speed = 0;

            if (previousData && previousData.lat && previousData.lng) {
                const distanceCovered = getDistance(
                    previousData.lat,
                    previousData.lng,
                    lat,
                    lng
                );

                const timeDiff =
                    (now - new Date(previousData.lastSeen)) / 1000;

                if (timeDiff > 0) {
                    const mps = distanceCovered / timeDiff;
                    speed = parseFloat((mps * 3.6).toFixed(2));
                }
            }

            const activeFence = await Geofence.findOne({ isActive: true });

            let geofenceData = {
                isInside: true,
                distance: 0,
                locationName: "None"
            };

            if (activeFence) {
                const dist = getDistance(
                    lat,
                    lng,
                    activeFence.latitude,
                    activeFence.longitude
                );

                geofenceData = {
                    isInside: dist <= activeFence.radius,
                    distance: Math.round(dist),
                    locationName: activeFence.name
                };
            }

            await deviceService.upsertDevice({
                deviceId,
                lat,
                lng,
                speed,
                battPct,
                battMv,
                battHealth,
                battLow,
                lastSeen: now
            });

            io.emit("location-update", {
                deviceId,
                lat,
                lng,
                speed,

                // Battery fields
                battPct,
                battMv,
                battHealth,
                battLow,

                ...geofenceData,
                lastSeen: now
            });
        }

        res.send("OK");
    } catch (err) {
        console.error("❌ SPEED CALC ERROR:", err);
        res.status(500).send("Error");
    }
};