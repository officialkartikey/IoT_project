const deviceService = require("../services/device.service");
const Emergency = require("../models/emergency.model");
const Geofence = require("../models/Geofence"); 
const { getIO } = require("../sockets/socket");
const { getDistance } = require("../utils/distance");

// ... top imports remain the same

exports.receiveData = async (req, res) => {
    const now = new Date();
    const istTime = now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    console.log("\n==================== 📥 [DEVICE DATA RECEIVED] ====================");
    console.log(`⏰ Timestamp : ${now.toISOString()} | IST: ${istTime}`);
    console.log(`🌐 Route     : ${req.method} ${req.originalUrl || req.url}`);
    console.log("📦 Raw Body  :", JSON.stringify(req.body, null, 2));

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

        const numLat = lat !== undefined && lat !== null ? parseFloat(lat) : 0;
        const numLng = lng !== undefined && lng !== null ? parseFloat(lng) : 0;
        const validGPS = !isNaN(numLat) && !isNaN(numLng) && !(numLat === 0 && numLng === 0);

        console.log("----------------------- 📊 PARSED TELEMETRY -----------------------");
        console.log(`🆔 Device ID : ${deviceId || "N/A"}`);
        console.log(`📍 GPS Fix   : ${validGPS ? "VALID ✅" : "NO FIX / ZERO (0,0) ⚠️"}`);
        console.log(`📌 Coords    : Lat: ${numLat}, Lng: ${numLng}`);
        console.log(`🔋 Battery   : ${battPct !== undefined ? battPct + "%" : "N/A"} | ${battMv ? battMv + " mV" : "N/A"} | Health: ${battHealth || "UNKNOWN"} | Low: ${battLow ?? false}`);
        console.log(`🚨 Alert Flag: ${alert ?? false}`);

        const io = getIO();

        let speed = 0;
        let geofenceData = {
            isInside: true,
            distance: 0,
            locationName: "None"
        };

        if (validGPS) {
            const fetchDevice = deviceService.getDeviceById || deviceService.getDevice;
            const previousData = fetchDevice ? await fetchDevice(deviceId) : null;

            if (previousData && previousData.lat && previousData.lng) {
                const distanceCovered = getDistance(
                    previousData.lat,
                    previousData.lng,
                    numLat,
                    numLng
                );

                const timeDiff =
                    (now - new Date(previousData.lastSeen)) / 1000;

                if (timeDiff > 0) {
                    const mps = distanceCovered / timeDiff;
                    speed = parseFloat((mps * 3.6).toFixed(2));
                }

                console.log(`⚡ Speed Calc: Distance = ${distanceCovered.toFixed(2)}m, TimeDiff = ${timeDiff.toFixed(1)}s -> Speed = ${speed} km/h`);
            } else {
                console.log(`⚡ Speed Calc: No previous position recorded. Initial speed set to 0 km/h`);
            }

            const activeFence = await Geofence.findOne({ isActive: true });

            if (activeFence) {
                const dist = getDistance(
                    numLat,
                    numLng,
                    activeFence.latitude,
                    activeFence.longitude
                );

                geofenceData = {
                    isInside: dist <= activeFence.radius,
                    distance: Math.round(dist),
                    locationName: activeFence.name
                };

                console.log(`🛡️  Geofence  : "${activeFence.name}" (Radius: ${activeFence.radius}m) | Distance: ${geofenceData.distance}m | Inside: ${geofenceData.isInside ? "YES ✅" : "NO (OUTSIDE) 🚨"}`);
            } else {
                console.log(`🛡️  Geofence  : No active geofence configured`);
            }

            await deviceService.upsertDevice({
                deviceId,
                lat: numLat,
                lng: numLng,
                speed,
                battPct,
                battMv,
                battHealth,
                battLow,
                lastSeen: now
            });
            console.log(`💾 Database  : Device telemetry updated for deviceId: ${deviceId}`);

            io.emit("location-update", {
                deviceId,
                lat: numLat,
                lng: numLng,
                speed,
                battPct,
                battMv,
                battHealth,
                battLow,
                ...geofenceData,
                lastSeen: now
            });
            console.log(`📡 Socket.io : "location-update" event broadcasted`);
        } else {
            console.log(`⚠️  GPS Lock : Coordinates are (0,0) or missing. Waiting for satellite lock.`);

            if (deviceId) {
                await deviceService.upsertDevice({
                    deviceId,
                    lat: numLat,
                    lng: numLng,
                    speed: 0,
                    battPct,
                    battMv,
                    battHealth,
                    battLow,
                    lastSeen: now
                });
                console.log(`💾 Database  : Device status & battery updated without GPS position`);
            }
        }

        const isAlert = alert === true || alert === "true" || alert === 1 || alert === "1";
        if (isAlert) {
            console.log(`🚨 [SOS ALERT DETECTED] Saving emergency record for device ${deviceId}...`);
            try {
                const emergencyLog = await Emergency.create({
                    deviceId,
                    lat: numLat,
                    lng: numLng,
                    type: "SOS",
                    battPct,
                    battMv,
                    battHealth,
                    battLow
                });
                console.log(`🚨 Emergency record saved (ID: ${emergencyLog._id})`);

                io.emit("emergency-alert", {
                    deviceId,
                    lat: numLat,
                    lng: numLng,
                    alert: true,
                    battPct,
                    timestamp: now
                });
                console.log(`📡 Socket.io : "emergency-alert" event broadcasted`);
            } catch (emergencyErr) {
                console.error(`⚠️ Failed to save Emergency record:`, emergencyErr.message);
            }
        }

        console.log("📤 Response  : 200 OK sent to device");
        console.log("=================================================================\n");

        res.status(200).send("OK");
    } catch (err) {
        console.error("\n❌ ================== [DEVICE DATA ERROR] ==================");
        console.error(`⏰ Timestamp : ${new Date().toISOString()}`);
        console.error(`Device ID   : ${req.body?.deviceId || "Unknown"}`);
        console.error(`Error Msg   : ${err.message}`);
        console.error("Stack Trace :\n", err.stack);
        console.error("============================================================\n");

        res.status(500).json({ success: false, message: "Error processing device data", error: err.message });
    }
};