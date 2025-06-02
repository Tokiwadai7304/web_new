const ratingModel = require('../models/ratingModel');
const movieModel = require('../models/movieModel');
const userModel = require('../models/usersModels');

async function updateMovieAverageRating(movieId) {
    const ratings = await ratingModel.find({ movieId: movieId });
    if (ratings.length > 0) {
        const totalRating = ratings.reduce((acc, curr) => acc + curr.rating, 0);
        const averageRating = totalRating / ratings.length;
        await movieModel.findByIdAndUpdate(movieId, {
            averageRating: averageRating.toFixed(1),
            numberOfRatings: ratings.length
        });
    } else {
        await movieModel.findByIdAndUpdate(movieId, {
            averageRating: 0,
            numberOfRatings: 0
        });
    }
}

// Rate, update rate 
exports.rateMovie = async (req, res) => {
    try {
        const { movieId, rating } = req.body;
        const userId = req.user._id;

        // Validate input
        if (!movieId || rating === undefined) {
            return res.status(400).json({ message: 'Movie ID and rating are required' });
        }
        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be an integer between 0 and 5' });
        }

        // Create or update the rating
        const existingRating = await ratingModel.findOne({ userId, movieId });
        if (existingRating) {
            existingRating.rating = rating;
            await existingRating.save();
        } else {
            const newRating = new ratingModel({ userId, movieId, rating });
            await newRating.save();
        }

        // Cập nhật rating trung bình
        await updateMovieAverageRating(movieId);

        res.status(200).json({ message: 'Rating submitted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Lấy danh sách rating 
exports.getRatings = async (req, res) => {
    try {
        const { movieId } = req.query;
        if (!movieId) {
            return res.status(400).json({ message: 'Movie ID is required' });
        }

        const ratings = await ratingModel.find({ movieId }).populate('userId', 'name');
        res.status(200).json(ratings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Xóa rating 
exports.deleteRating = async (req, res) => {
    try {
        const { ratingId } = req.params;
        const userId = req.user._id;

        const rating = await ratingModel.findById(ratingId);
        if (!rating) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        if (rating.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this rating' });
        }

        const movieIdToUpdate = rating.movieId;
        await ratingModel.findByIdAndDelete(ratingId);
        await updateMovieAverageRating(movieIdToUpdate);

        res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};