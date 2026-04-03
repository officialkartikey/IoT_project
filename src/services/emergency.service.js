const Emergency = require("../models/emergency.model");

exports.getHistory = async (deviceId) => {
    return await Emergency.find({ deviceId })
        .sort({ createdAt: -1 }) // latest first
        .limit(50); // 🔥 limit for performance
};