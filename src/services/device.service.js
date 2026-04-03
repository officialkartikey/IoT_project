const Device = require("../models/device.model");

exports.upsertDevice = async (data) => {
    return await Device.findOneAndUpdate(
        { deviceId: data.deviceId },
        {
            // 🔥 Only update required fields (optimized)
            $set: {
                lat: data.lat,
                lng: data.lng,
                lastSeen: data.lastSeen,
                isOnline: true
            }
        },
        {
            upsert: true,
            returnDocument: "after"
        }
    );
};

exports.getDevice = async (deviceId) => {
    return await Device.findOne(
        { deviceId },
        { deviceId: 1, lat: 1, lng: 1, alert: 1, lastSeen: 1 } // 🔥 projection (faster)
    );
};