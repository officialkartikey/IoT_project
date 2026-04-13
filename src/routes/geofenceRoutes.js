const express = require('express');
const router = express.Router();
const Geofence = require('../models/Geofence');

// 1. Get all saved locations
router.get('/', async (req, res) => {
    const locations = await Geofence.find();
    res.json(locations);
});

// 2. Save a new location
router.post('/', async (req, res) => {
    const { name, latitude, longitude, radius } = req.body;
    const newLocation = new Geofence({ name, latitude, longitude, radius });
    await newLocation.save();
    res.status(201).json(newLocation);
});

// 3. Set a specific location as "Active"
router.patch('/activate/:id', async (req, res) => {
    // Deactivate all first
    await Geofence.updateMany({}, { isActive: false });
    // Activate the selected one
    const active = await Geofence.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    res.json(active);
});

module.exports = router;