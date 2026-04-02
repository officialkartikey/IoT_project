const Device = require("../models/device.model");

exports.upsertDevice = async (data) => {
    return await Device.findOneAndUpdate(
        { deviceId: data.deviceId },
        data,
        { upsert: true, new: true }
    );
};

exports.getDevice = async (deviceId) => {
    return await Device.findOne({ deviceId });
};