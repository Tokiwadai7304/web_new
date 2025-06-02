const usersModels = require("../models/usersModels");
const { hashPassword, doHashvalidate } = require("../utils/passEncode");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
    const { email, password, name, role } = req.body;
    try {
        const existingUser = await usersModels.findOne({ email });

        if (existingUser) {
            return res.status(402).json({ success: false, message: 'Email has already been used' });
        }

        const hashedPassword = await hashPassword(password, 12);
        const newUser = await usersModels.create({
            email,
            password: hashedPassword,
            name,
            role
        });

        const result = await newUser.save();
        result.password = undefined;
        res.status(201).json({ success: true, message: 'User created successfully', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await usersModels.findOne({ email }).select('+password');
        if (!existingUser)
            return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const result = await doHashvalidate(password, existingUser.password);
        if (!result)
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        const token = jwt.sign({
            id: existingUser._id,
            email: existingUser.email,
            name: existingUser.name,
            verfied: existingUser.verified,
            role: existingUser.role
        }, process.env.TOKEN_SECRET, { expiresIn: '8h' });
        res.cookie("Authorization", 'Bearer' + token, {
            expires: new Date(Date.now() + 8 * 3600000),
            httpOnly: process.env.NODE_ENV === "production",
            secure: process.env.NODE_ENV === "production"
        }).status(200).json({ success: true, message: 'Login successful', token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.signout = async (req, res) => {
    try {
        res.clearCookie("Authorization", {
            httpOnly: process.env.NODE_ENV === "production",
            secure: process.env.NODE_ENV === "production"
        });
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};