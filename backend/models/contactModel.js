const mongoose = require('mongoose');
const contactSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Name is required'],
        minlength: [1, 'Name must be at least 1 character long'],
        trim: true,
    },
    email:{
        type: String,
        required: [true, 'Email is required'],
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
        trim: true,
    },
    content:{
        type: String,
        required: [true, 'Content is required'],
        minlength: [1, 'Content must be at least 1 character long'],
        trim: true,
    }
}, { timestamps: true });
module.exports = mongoose.model('Contact', contactSchema);