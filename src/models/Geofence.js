const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Home", "Office"
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    radius: { type: Number, required: true }, // in meters
    isActive: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Geofence', geofenceSchema);