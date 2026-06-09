const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
    deviceId: String,
    lat: Number,
    lng: Number,
    alert: Boolean,
    battery: Number,
    gps: Boolean,
    lastSeen: Date,
    speed: { type: Number, default: 0 },
    isOnline: Boolean
}, { timestamps: true });

module.exports = mongoose.model("Device", deviceSchema);