import React, { useEffect, useState, useCallback } from 'react'; // Thêm useCallback
import axios from 'axios';
import { useParams, Link } from 'react-router-dom'; // Import Link
import { useAuth } from '../context/AuthContext';
import '../App.css';

function MovieDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, token } = useAuth(); // Bỏ 'user' vì không dùng trực tiếp
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);

  // Hàm để fetch chi tiết phim
  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:8000/api/movies/${id}`);
        setMovie(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load movie details. Please check the movie ID or API.');
        setLoading(false);
        console.error('Error fetching movie details:', err);
      }
    };

    fetchMovie();
  }, [id]);

  // Hàm để fetch bình luận của phim, sử dụng useCallback để tránh warning
  const fetchComments = useCallback(async () => {
    setCommentLoading(true);
    setCommentError(null);
    try {
      const response = await axios.get(`http://localhost:8000/api/comments?movieId=${id}`);
      setComments(response.data);
      setCommentLoading(false);
    } catch (err) {
      setCommentError('Failed to load comments.');
      setCommentLoading(false);
      console.error('Error fetching comments:', err);
    }
  }, [id]); // fetchComments phụ thuộc vào 'id'

  // Gọi fetchComments khi component mount hoặc khi ID phim thay đổi
  useEffect(() => {
    fetchComments();
  }, [fetchComments]); // Thêm fetchComments vào dependency array

  // Hàm xử lý gửi bình luận mới
  const handleAddComment = async (event) => {
    event.preventDefault();
    setCommentError(null);
    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }

    try {
      await axios.post(
        'http://localhost:8000/api/comments',
        { movieId: id, content: newComment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setNewComment('');
      fetchComments(); // Tải lại danh sách bình luận sau khi thêm
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to add comment. Please login.');
      console.error('Error adding comment:', err);
    }
  };

  if (loading) {
    return <div className="container">Loading movie details...</div>;
  }

  if (error) {
    return <div className="container error-message">{error}</div>;
  }

  if (!movie) {
    return <div className="container">Movie not found.</div>;
  }

  return (
    <div className="container movie-detail-page">
      <div className="movie-detail-header">
        {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} className="movie-detail-poster" />}
        <h1>{movie.title}</h1>
      </div>
      <div className="movie-info">
        <p><strong>Genre:</strong> {movie.genre}</p>
        <p><strong>Director:</strong> {movie.director}</p>
        <p><strong>Release Date:</strong> {new Date(movie.releaseDate).toLocaleDateString()}</p>
        <p><strong>Cast:</strong> {movie.cast ? movie.cast.join(', ') : 'N/A'}</p>
        <p>{movie.description}</p>
        {movie.trailerUrl && (
          <p>
            <strong>Trailer:</strong>{' '}
            <a href={movie.trailerUrl} target="_blank" rel="noopener noreferrer">
              Watch Trailer
            </a>
          </p>
        )}
      </div>

      <div className="ratings-section">
        <h3>Ratings</h3>
        <p>Average Rating: {movie.averageRating || 'N/A'} ({movie.numberOfRatings || 0} ratings)</p>
        {/* Phần đánh giá sẽ được thêm vào sau */}
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        {commentLoading && <p>Loading comments...</p>}
        {commentError && <p className="error-message">{commentError}</p>}
        {!commentLoading && comments.length === 0 && <p>No comments yet.</p>}

        {/* Form thêm bình luận (chỉ hiển thị khi đã đăng nhập) */}
        {isAuthenticated ? (
          <form className="comment-form" onSubmit={handleAddComment}>
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows="4"
            ></textarea>
            <button type="submit">Post Comment</button>
          </form>
        ) : (
          <p>Please <Link to="/login">login</Link> to add comments.</p>
        )}

        {/* Danh sách bình luận */}
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <p className="comment-author"><strong>{comment.name || 'Anonymous'}</strong> <span className="comment-date">({new Date(comment.createdAt).toLocaleDateString()})</span></p>
              <p className="comment-content">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;