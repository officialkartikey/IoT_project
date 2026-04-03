const emergencyService = require("../services/emergency.service");

exports.getHistory = async (req, res) => {
    try {
        const { deviceId } = req.query;

        if (!deviceId) {
            return res.status(400).json({
                message: "deviceId required"
            });
        }

        const data = await emergencyService.getHistory(deviceId);

        res.json({
            success: true,
            count: data.length,
            data
        });

    } catch (err) {
        console.error("❌ ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};