const Contact  = require('../models/contactModel');
exports.addContact = async (req, res) => {
    try{
        const {name, email, content} = req.body;
        if (!name || !email || !content) {
            return res.status(400).json({ message: 'Name, email, and content are required' });
        }
        const contact = await Contact.create({
            name,
            email,
            content
        });
        res.status(201).json({
            message: 'Contact added successfully',
            contact: {
                _id: contact._id,
                name: contact.name,
                email: contact.email,
                content: contact.content,
                createdAt: contact.createdAt
            }
        });
    }
    catch (error) {
        console.error('Contact add error:', error);
        res.status(500).json({ message: 'Server error', error: error.message }); 
    }
}

exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(contacts.map(c => ({
            _id: c._id,
            name: c.name,
            email: c.email,
            content: c.content,
            createdAt: c.createdAt
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

