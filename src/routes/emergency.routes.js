const express = require("express");
const router = express.Router();
const emergencyController = require("../controllers/emergency.controller");

router.get("/history", emergencyController.getHistory);

module.exports = router;