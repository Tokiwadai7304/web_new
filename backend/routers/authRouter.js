const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/authController');
const { validateSignup, validateSignin } = require('../middlewares/validateMiddleware');

authRouter.post('/signup', validateSignup, authController.signup);
authRouter.post('/signin', validateSignin, authController.signin);
authRouter.post('/signout', authController.signout);

module.exports = authRouter;