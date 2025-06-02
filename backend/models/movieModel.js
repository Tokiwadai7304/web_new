const mongoose = require('mongoose');
const movieSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        auto: true,
        unique: true,
        required: [true, 'Movie ID is required'],
    },
    title:{
        type: String,
        required: [true, 'Title is required'],
        minlength: [1, 'Title must be at least 1 character long'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        minlength: [1, 'Description must be at least 1 character long'],
        trim: true,
    },
    releaseDate: {
        type: Date,
        required: [true, 'Release date is required'],
    },
    genre: {
        type: String,
        required: [true, 'Genre is required'],
        minlength: [1, 'Genre must be at least 1 character long'],
        trim: true,
    },
    director: {
        type: String,
        required: [true, 'Director is required'],
        minlength: [1, 'Director must be at least 1 character long'],
        trim: true,
    },
    cast: {
        type: [String],
        required: [true, 'Cast is required'],
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: 'Cast must contain at least one actor'
        }
    },
    posterUrl: {
        type: String,
        required: [true, 'Poster URL is required'],
        validate: {
            validator: function(v) {
                return /^(http|https):\/\/[^ "]+$/.test(v);
            },
            message: 'Poster URL must be a valid URL'
        }
    },
    trailerUrl: {
        type: String,
        required: [true, 'Trailer URL is required'],
        validate: {
            validator: function(v) {
                return /^(http|https):\/\/[^ "]+$/.test(v);
            },
            message: 'Trailer URL must be a valid URL'
        }
    },
    averageRating: { 
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numberOfRatings: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });
module.exports = mongoose.model('Movie', movieSchema);