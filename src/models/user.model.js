const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    phone: String,
    password: String,
    deviceId: String,

    nomineeName: String,
    nomineeContact: String,
    nomineeRelation: String
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);