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
        // Nếu req.body.releaseDate là string YYYY-MM-DD, Mongoose cũng sẽ cast nó.
        // Để nhất quán, có thể chuẩn hóa ở đây giống như trong update.
        if (newMovie.releaseDate && typeof newMovie.releaseDate === 'string' && newMovie.releaseDate.length === 10) {
            const parts = newMovie.releaseDate.split('-');
            if (parts.length === 3) {
                newMovie.releaseDate = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                console.log("addMovie - Normalized releaseDate to UTC midnight:", newMovie.releaseDate);
            }
        }
        await newMovie.save();
        res.status(201).json({ message: 'Movie added successfully', movie: newMovie });
    } catch (error) {
        console.error("Error in addMovie:", error); 
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

movieController.getAllMovies = async (req, res) => {
    try {
        const { search, genre, sortBy, sortOrder } = req.query;
        // console.log("getAllMovies - Received req.query:", req.query);
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (genre) {
            query.genre = { $regex: genre, $options: 'i' };
        }

        let sortOptions = { releaseDate: -1 }; 

        if (sortBy) {
            const order = (sortOrder === 'asc' || sortOrder === '1' || sortOrder === 1) ? 1 : -1;
            const validSortFields = ['title', 'releaseDate', 'averageRating'];
            if (validSortFields.includes(sortBy)) {
                sortOptions = { [sortBy]: order };
            } else if (sortBy === 'rating') { 
                sortOptions = { 'averageRating': order };
            }
        }
        // console.log("getAllMovies - Constructed query:", query);
        // console.log("getAllMovies - Constructed sortOptions:", sortOptions);
        const movies = await movie.find(query).sort(sortOptions);
        res.status(200).json(movies);
    } catch (error) {
        console.error("Error in getAllMovies:", error); 
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

movieController.updateMovieById = async (req, res) => {
    try {
        const { id } = req.params; 
        const updateData = req.body; 

        console.log(`Backend: updateMovieById (ID: ${id}) - Received updateData:`, JSON.stringify(updateData, null, 2));

        // Chuẩn hóa releaseDate nếu nó được gửi và là string YYYY-MM-DD
        if (updateData.releaseDate && typeof updateData.releaseDate === 'string') {
            const dateString = updateData.releaseDate;
            if (dateString.length === 10 && dateString.countChar('-') === 2) { // Kiểm tra định dạng YYYY-MM-DD đơn giản
                const parts = dateString.split('-');
                // Month is 0-indexed for JavaScript Date constructor (0 for January, 11 for December)
                updateData.releaseDate = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                console.log("Backend: updateMovieById - Normalized updateData.releaseDate to UTC midnight:", updateData.releaseDate.toISOString());
            } else if (dateString === '') {
                // Nếu frontend gửi chuỗi rỗng, không nên để Mongoose tự ý xử lý
                // Vì releaseDate là required, Mongoose sẽ báo lỗi validation nếu nó là null/undefined.
                // Nếu bạn muốn cho phép xóa ngày, bạn phải bỏ 'required' trong model.
                // Hiện tại, chúng ta sẽ coi chuỗi rỗng là không hợp lệ và để validator xử lý.
                // Hoặc bạn có thể xóa trường này khỏi updateData để nó không được cập nhật.
                // delete updateData.releaseDate; 
                // console.log("Backend: updateMovieById - Empty releaseDate string received, letting validator handle or was removed.");
                 return res.status(400).json({ message: 'Release date cannot be empty if provided. Please provide a valid date or do not include the field if no change is intended.' });
            } else {
                 console.warn("Backend: updateMovieById - releaseDate string received but not in YYYY-MM-DD format or not empty:", dateString);
                 // Để Mongoose cố gắng parse, hoặc bạn có thể trả lỗi nếu định dạng không đúng.
                 // Nếu định dạng không đúng, new Date(dateString) có thể ra Invalid Date
            }
        }
        // String.prototype.countChar = function(char) { // Helper function, nên đặt ở ngoài hoặc dùng cách khác
        //     let count = 0;
        //     for (let i = 0; i < this.length; i++) {
        //         if (this[i] === char) {
        //             count++;
        //         }
        //     }
        //     return count;
        // };


        const updatedMovie = await movie.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

        if (!updatedMovie) {
            return res.status(404).json({ message: 'Movie not found with the given ID.' });
        }

        console.log("Backend: updateMovieById - Movie updated successfully:", JSON.stringify(updatedMovie, null, 2));
        res.status(200).json({ message: 'Movie updated successfully by ID', movie: updatedMovie });
    } catch (error) {
        console.error("Backend: Error in updateMovieById:", error);
        if (error.name === 'ValidationError') {
             return res.status(400).json({ message: 'Validation Error', errors: error.errors });
        }
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Movie ID format.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Hàm deleteMovie vẫn giữ nguyên logic tìm theo title
movieController.deleteMovie = async (req, res) => {
 try {
        const { title } = req.params;
        const existingMovie = await movie.findOne({ title: title });
        if (!existingMovie) {
            return res.status(404).json({ message: 'Movie not found with the given title.' });
        }

        const movieIdToDelete = existingMovie._id;
        
        await comment.deleteMany({ movieId: movieIdToDelete });
        await rate.deleteMany({ movieId: movieIdToDelete }); 

        const deletedMovie = await movie.findByIdAndDelete(movieIdToDelete);

        if (!deletedMovie) { 
            return res.status(404).json({ message: 'Movie could not be deleted (already removed or not found).' });
        }
        res.status(200).json({ message: 'Movie and associated data deleted successfully by title' });
    } catch (error)
    {
        console.error("Error in deleteMovie:", error); 
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

movieController.getMovieById = async (req, res) => {
    try {
        const { id } = req.params; 
        
        const foundMovie = await movie.findById(id); 

        if (!foundMovie) {
            return res.status(404).json({ message: 'Movie not found.' });
        }
        res.status(200).json(foundMovie);
    } catch (error) {
        console.error("Error in getMovieById:", error); 
        res.status(500).json({ message: 'Server error or invalid movie ID format.', error: error.message }); 
    }
};

// Helper function để đếm ký tự (bạn có thể định nghĩa ở nơi khác nếu muốn)
String.prototype.countChar = function(char) {
    let count = 0;
    for (let i = 0; i < this.length; i++) {
        if (this[i] === char) {
            count++;
        }
    }
    return count;
};


module.exports = movieController;