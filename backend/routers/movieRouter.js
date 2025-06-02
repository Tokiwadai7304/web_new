const express = require('express');
const movieRouter = express.Router();
const movieController = require('../controllers/movieController');
const { verifyToken, authorizeRoles } = require('../middlewares/validateMiddleware');


movieRouter.post('/', verifyToken, authorizeRoles(['admin']), movieController.addMovie);
movieRouter.get('/', movieController.getAllMovies);
movieRouter.get('/:id', movieController.getMovieById); // <-- THÊM DÒNG NÀY
movieRouter.put('/by-name/:title', verifyToken, authorizeRoles(['admin']), movieController.updateMovie);
movieRouter.delete('/by-name/:title', verifyToken, authorizeRoles(['admin']), movieController.deleteMovie);

module.exports = movieRouter;