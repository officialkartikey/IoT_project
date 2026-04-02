const userService = require("../services/user.service");
const { generateToken } = require("../utils/jwt");

exports.register = async (req, res) => {
    try {
        const user = await userService.register(req.body);
        const token = generateToken(user);

        res.json({ user, token });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

exports.login = async (req, res) => {
    const { deviceId, password } = req.body;

    const user = await userService.login(deviceId, password);
    const token = generateToken(user);

    res.json({ user, token });
};