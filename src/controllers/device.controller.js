const deviceService = require("../services/device.service");
const { io } = require("../sockets/socket");
const { getDistance } = require("../utils/distance");

const SAFE_ZONE = {
    lat: 28.677,
    lng: 77.501,
    radius: 200
};

exports.receiveData = async (req, res) => {
    const data = {
        ...req.body,
        lastSeen: new Date(),
        isOnline: true
    };

    const device = await deviceService.upsertDevice(data);

    io.emit("location-update", device);

    // Geofence check
    const dist = getDistance(
        data.lat,
        data.lng,
        SAFE_ZONE.lat,
        SAFE_ZONE.lng
    );

    if (dist > SAFE_ZONE.radius || data.alert) {
        io.emit("emergency-alert", device);
    }

    res.send("OK");
};