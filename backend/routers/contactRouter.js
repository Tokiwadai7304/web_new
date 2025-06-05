const express = require('express');
const contactRouter = express.Router();
const contactController = require('../controllers/contactController');

contactRouter.post('/', contactController.addContact);
contactRouter.get('/', contactController.getContacts);

module.exports = contactRouter;
