const Device = require("../models/device.model");

exports.upsertDevice = async (data) => {
    return await Device.findOneAndUpdate(
        { deviceId: data.deviceId },
        data,
        {
            upsert: true,
            returnDocument: "after" // ✅ FIX (no warning now)
        }
    );
};

exports.getDevice = async (deviceId) => {
    return await Device.findOne({ deviceId });
};