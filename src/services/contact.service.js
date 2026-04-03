const Contact = require("../models/contact.model");

exports.addContact = async (data) => {
    const count = await Contact.countDocuments({ deviceId: data.deviceId });

    if (count >= 5) {
        throw new Error("Maximum 5 contacts allowed");
    }

    return await Contact.create(data);
};

exports.getContacts = async (deviceId) => {
    return await Contact.find({ deviceId });
};

exports.deleteContact = async (id) => {
    return await Contact.findByIdAndDelete(id);
};