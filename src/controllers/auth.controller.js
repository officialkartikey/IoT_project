const userService = require("../services/user.service");
const { generateToken } = require("../utils/jwt");

exports.register = async (req, res) => {
    const user = await userService.register(req.body);
    const token = generateToken(user);

    res.json({ user, token });
};

exports.login = async (req, res) => {
    const { deviceId, password } = req.body;

    const user = await userService.login(deviceId, password);
    const token = generateToken(user);

    res.json({ user, token });
};