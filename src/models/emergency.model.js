const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true
    },

    lat: Number,
    lng: Number,

    type: {
        type: String,
        default: "SOS"
    },

    // Battery Information
    battPct: {
        type: Number,
        default: null
    },

    battMv: {
        type: Number,
        default: null
    },

    battHealth: {
        type: String,
        default: "UNKNOWN"
    },

    battLow: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 2 // auto delete after 2 days
    }
});

module.exports = mongoose.model("Emergency", emergencySchema);