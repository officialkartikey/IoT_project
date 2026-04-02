const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
    deviceId: String,
    lat: Number,
    lng: Number,
    battery: Number,
    alert: Boolean,
    gps: Boolean,
    lastSeen: Date,
    isOnline: Boolean
});

module.exports = mongoose.model("Device", deviceSchema);