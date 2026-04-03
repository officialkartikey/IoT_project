const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema({
    deviceId: String,
    lat: Number,
    lng: Number,
    type: {
        type: String,
        default: "SOS"
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 2 // 🔥 auto delete after 2 days
    }
});

module.exports = mongoose.model("Emergency", emergencySchema);