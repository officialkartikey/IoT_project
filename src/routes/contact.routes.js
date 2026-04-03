const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");

router.post("/add", contactController.addContact);
router.get("/list", contactController.getContacts);
router.delete("/:id", contactController.deleteContact);

module.exports = router;