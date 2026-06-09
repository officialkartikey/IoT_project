const Device = require("../models/device.model");

exports.upsertDevice = async (data) => {
    return await Device.findOneAndUpdate(
        { deviceId: data.deviceId },
        {
            $set: {
                lat: data.lat,
                lng: data.lng,
                speed: data.speed,
                lastSeen: data.lastSeen,
                isOnline: true,

                // Battery fields
                battPct: data.battPct,
                battMv: data.battMv,
                battHealth: data.battHealth,
                battLow: data.battLow
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
        {
            deviceId: 1,
            lat: 1,
            lng: 1,
            speed: 1,
            alert: 1,
            lastSeen: 1,

            // Battery fields
            battPct: 1,
            battMv: 1,
            battHealth: 1,
            battLow: 1
        }
    );
};