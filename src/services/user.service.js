const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

exports.register = async (data) => {

    // 🔥 CHECK FIRST
    const existing = await User.findOne({ deviceId: data.deviceId });

    if (existing) {
        throw new Error("Device already registered ❌");
    }

    const hashed = await bcrypt.hash(data.password, 10);
    data.password = hashed;

    return await User.create(data);
};