const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

// ✅ REGISTER
exports.register = async (data) => {
    const existing = await User.findOne({ deviceId: data.deviceId });

    if (existing) {
        throw new Error("Device already registered ❌");
    }

    const hashed = await bcrypt.hash(data.password, 10);
    data.password = hashed;

    return await User.create(data);
};

// ✅ LOGIN (THIS WAS MISSING ❌)
exports.login = async (deviceId, password) => {
    const user = await User.findOne({ deviceId });

    if (!user) {
        throw new Error("User not found ❌");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw new Error("Invalid password ❌");
    }

    return user;
};