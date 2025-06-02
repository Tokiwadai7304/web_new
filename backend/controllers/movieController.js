const movie = require('../models/movieModel');
const comment = require('../models/commentModels');
const rate = require('../models/ratingModel');

const movieController = {};

async function updateMovieAverageRating(movieId) {
    const ratings = await rate.find({ movieId: movieId });
    if (ratings.length > 0) {
        const totalRating = ratings.reduce((acc, curr) => acc + curr.rating, 0);
        const averageRating = totalRating / ratings.length;
        await movie.findByIdAndUpdate(movieId, {
            averageRating: averageRating.toFixed(1),
            numberOfRatings: ratings.length
        });
    } else {
        await movie.findByIdAndUpdate(movieId, {
            averageRating: 0,
            numberOfRatings: 0
        });
    }
}


movieController.addMovie = async (req, res) => {
    try {
        const newMovie = new movie(req.body);
        await newMovie.save();
        res.status(201).json({ message: 'Movie added successfully', movie: newMovie });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

movieController.getAllMovies = async (req, res) => {
    try {
        const { search, genre } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (genre) {
            query.genre = { $regex: genre, $options: 'i' };
        }

        const movies = await movie.find(query).sort({ releaseDate: -1 });
        res.status(200).json(movies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

movieController.updateMovie = async (req, res) => {
try {
        const { title } = req.params; 
        const updateData = req.body; 

        const existingMovie = await movie.findOne({ title: title });
        if (!existingMovie) {
            return res.status(404).json({ message: 'Movie not found with the given title.' });
        }
        const updatedMovie = await movie.findByIdAndUpdate(existingMovie._id, updateData, { new: true, runValidators: true });

        res.status(200).json({ message: 'Movie updated successfully by title', movie: updatedMovie });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

movieController.deleteMovie = async (req, res) => {
 try {
        const { title } = req.params;
        const existingMovie = await movie.findOne({ title: title });
        if (!existingMovie) {
            return res.status(404).json({ message: 'Movie not found with the given title.' });
        }

        const movieIdToDelete = existingMovie._id;

        const deletedMovie = await movie.findByIdAndDelete(movieIdToDelete);

        if (!deletedMovie) { 
            return res.status(404).json({ message: 'Movie could not be deleted (already removed or not found).' });
        }
        await comment.deleteMany({ movieId: movieIdToDelete });
        await rate.deleteMany({ movieId: movieIdToDelete });
        res.status(200).json({ message: 'Movie and associated data deleted successfully by title' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

movieController.getMovieById = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ URL parameter (từ '/:id' trong router)
        
        // Tìm phim trong MongoDB bằng ID
        const foundMovie = await movie.findById(id); 

        if (!foundMovie) {
            // Nếu không tìm thấy phim với ID này
            return res.status(404).json({ message: 'Movie not found.' });
        }

        // Trả về dữ liệu phim nếu tìm thấy
        res.status(200).json(foundMovie);
    } catch (error) {
        console.error(error);
        // Xử lý lỗi server hoặc trường hợp ID không đúng định dạng ObjectId của MongoDB
        res.status(500).json({ message: 'Server error or invalid movie ID format.' }); 
    }
};

module.exports = movieController;