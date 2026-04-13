const mqtt = require("mqtt");
const Geofence = require("../models/Geofence");
const { getIO } = require("../sockets/socket"); // Assuming you export io from your socket file

const client = mqtt.connect(process.env.MQTT_BROKER_URL);

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Meters
    const p1 = lat1 * Math.PI/180;
    const p2 = lat2 * Math.PI/180;
    const dp = (lat2-lat1) * Math.PI/180;
    const dl = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dp/2)**2 + Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const initGeofenceEngine = () => {
    client.on("connect", () => {
        client.subscribe("device/gps");
        console.log("📡 MQTT Connected & Subscribed to Geofence Topic");
    });

    client.on("message", async (topic, message) => {
        if (topic === "device/gps") {
            const { lat, lon } = JSON.parse(message.toString());
            const io = getIO();

            // Fetch the currently active fence from DB
            const activeFence = await Geofence.findOne({ isActive: true });

            if (activeFence) {
                const distance = calculateDistance(lat, lon, activeFence.latitude, activeFence.longitude);
                const isOutside = distance > activeFence.radius;

                // Send real-time status to the Next.js Dashboard
                io.emit("geofence-status", {
                    locationName: activeFence.name,
                    isOutside,
                    distance: Math.round(distance)
                });
            }
        }
    });
};

module.exports = { initGeofenceEngine };