const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

exports.register = async (data) => {
    const hashed = await bcrypt.hash(data.password, 10);
    data.password = hashed;

    return await User.create(data);
};

exports.login = async (deviceId, password) => {
    const user = await User.findOne({ deviceId });

    if (!user) throw new Error("User not found");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid password");

    return user;
};