const express = require('express');
const ratingRouter = express.Router();
const rateController = require('../controllers/rateController');
const { verifyToken } = require('../middlewares/validateMiddleware');


ratingRouter.post('/', verifyToken, rateController.rateMovie);
ratingRouter.get('/', rateController.getRatings);
ratingRouter.delete('/:ratingId', verifyToken, rateController.deleteRating);

module.exports = ratingRouter;