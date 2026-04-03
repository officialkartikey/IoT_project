const deviceService = require("../services/device.service");
const { io } = require("../sockets/socket");

exports.receiveData = async (req, res) => {
    try {
        console.log("🔥 DEVICE API HIT");
        console.log("📦 Incoming Data:", req.body);

        let { deviceId, lat, lng, alert } = req.body;

        // ensure boolean
        alert = alert === true || alert === "true";

        // ❌ IGNORE NON-ALERT DATA
        if (!alert) {
            console.log("⏭️ Skipping normal data (alert=false)");
            return res.send("Ignored");
        }

        // 🚨 ONLY SAVE ALERT DATA
        const data = {
            deviceId,
            lat,
            lng,
            alert: true,
            lastSeen: new Date(),
            isOnline: true
        };

        const device = await deviceService.upsertDevice(data);

        console.log("💾 ALERT SAVED:", device.deviceId);

        // 🔔 Emit to frontend
        io.emit("emergency-alert", device);

        res.send("ALERT SAVED");

    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).send("Error");
    }
};