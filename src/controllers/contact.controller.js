const contactService = require("../services/contact.service");

exports.addContact = async (req, res) => {
    try {
        const contact = await contactService.addContact(req.body);

        res.json({
            success: true,
            data: contact
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

exports.getContacts = async (req, res) => {
    try {
        const { deviceId } = req.query;

        const contacts = await contactService.getContacts(deviceId);

        res.json({
            success: true,
            count: contacts.length,
            data: contacts
        });

    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        await contactService.deleteContact(req.params.id);

        res.json({
            success: true,
            message: "Deleted"
        });

    } catch (err) {
        res.status(500).json({ message: "Error" });
    }
};