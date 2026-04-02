const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
    deviceId: String,
    lat: Number,
    lng: Number,
    alert: Boolean,
    battery: Number,
    gps: Boolean,
    lastSeen: Date,
    isOnline: Boolean
}, { timestamps: true });

module.exports = mongoose.model("Device", deviceSchema);