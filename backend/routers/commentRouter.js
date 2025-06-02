const express = require('express');
const commentRouter = express.Router();
const commentController = require('../controllers/commentController');
const { verifyToken, authorizeRoles } = require('../middlewares/validateMiddleware'); 


commentRouter.post('/', verifyToken, commentController.addComment);
commentRouter.get('/', commentController.getComments);
commentRouter.delete('/:commentId', verifyToken, commentController.deleteComment);

module.exports = commentRouter;