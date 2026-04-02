const mongoose = require("mongoose");

const peopleSchema = new mongoose.Schema({
    name: String,
    phone: String,
    password: String,
    deviceId: { type: String, unique: true },

    nomineeName: String,
    nomineeContact: String,
    nomineeRelation: String
}, { timestamps: true });

// 👇 IMPORTANT CHANGE
module.exports = mongoose.model("People", peopleSchema);