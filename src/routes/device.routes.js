const router = require("express").Router();
const device = require("../controllers/device.controller");

router.post("/device-data", device.receiveData);

module.exports = router;