const Comment = require('../models/commentModels'); 
const User = require('../models/usersModels');

// Thêm comment
exports.addComment = async (req, res) => {
    try {
        const userId = req.user._id;
        const { movieId, content } = req.body;

        if (!movieId || !content) {
            return res.status(400).json({ message: 'Movie ID and content are required' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const comment = await Comment.create({
            content,
            userId,
            movieId,
            name: user.name
        });

        res.status(201).json({
            message: 'Comment added successfully',
            comment: {
                _id: comment._id,
                content: comment.content,
                name: comment.name,
                createdAt: comment.createdAt
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { movieId } = req.query;
        if (!movieId) {
            return res.status(400).json({ message: 'Movie ID is required' });
        }
        const comments = await Comment.find({ movieId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json(comments.map(c => ({
            _id: c._id,
            content: c.content,
            name: c.userId ? c.userId.name : c.name, 
            createdAt: c.createdAt
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Xóa comment 
exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Chỉ chủ comment hoặc admin mới được xóa
        if (comment.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};