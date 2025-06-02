import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function MovieDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, token, user } = useAuth(); // Thêm user để biết ID của người dùng hiện tại
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);

  const [userRating, setUserRating] = useState(0); // State để lưu đánh giá của người dùng hiện tại
  const [ratingError, setRatingError] = useState(null); // State lỗi cho đánh giá
  const [ratingSuccess, setRatingSuccess] = useState(null); // State thành công cho đánh giá

  // Hàm để fetch chi tiết phim (đã có)
  const fetchMovie = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchMovie();
  }, [fetchMovie]); // Depend on fetchMovie

  // Hàm để fetch bình luận của phim (đã có)
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
  }, [id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Hàm để lấy đánh giá của người dùng hiện tại (nếu có)
  const fetchUserRating = useCallback(async () => {
    if (!isAuthenticated || !user) {
        setUserRating(0); // Reset nếu không đăng nhập
        return;
    }
    try {
        const response = await axios.get(`http://localhost:8000/api/ratings?movieId=${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // Tìm đánh giá của người dùng hiện tại trong danh sách
        const currentUserRating = response.data.find(r => r.userId === user.id);
        setUserRating(currentUserRating ? currentUserRating.rating : 0);
    } catch (err) {
        console.error('Error fetching user rating:', err);
        setUserRating(0); // Đặt về 0 nếu có lỗi
    }
  }, [id, isAuthenticated, token, user]);

  useEffect(() => {
    fetchUserRating();
  }, [fetchUserRating]);


  // Hàm xử lý gửi bình luận mới (đã có)
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
      fetchComments();
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to add comment. Please login.');
      console.error('Error adding comment:', err);
    }
  };

  // Hàm xử lý gửi/cập nhật đánh giá
  const handleRateMovie = async (ratingValue) => {
    if (!isAuthenticated) {
        setRatingError('Please login to rate movies.');
        return;
    }
    if (ratingValue < 1 || ratingValue > 5) { // Kiểm tra giá trị hợp lệ
        setRatingError('Rating must be between 1 and 5.');
        return;
    }
    setRatingError(null);
    setRatingSuccess(null);

    try {
        await axios.post(
            'http://localhost:8000/api/ratings', // API rateMovie
            { movieId: id, rating: ratingValue },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        setRatingSuccess('Rating submitted successfully!');
        setUserRating(ratingValue); // Cập nhật ngay đánh giá của người dùng
        fetchMovie(); // Tải lại thông tin phim để cập nhật điểm trung bình
    } catch (err) {
        setRatingError(err.response?.data?.message || 'Failed to submit rating.');
        console.error('Error submitting rating:', err);
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
        <p>Average Rating: {movie.averageRating ? `${movie.averageRating}/5` : 'N/A'} ({movie.numberOfRatings || 0} ratings)</p>
        
        {/* Phần đánh giá của người dùng */}
        {isAuthenticated ? (
          <div className="user-rating-form">
            <p>Your rating: {userRating > 0 ? `${userRating}/5` : 'Not rated yet'}</p>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= userRating ? 'selected' : ''}`}
                  onClick={() => handleRateMovie(star)}
                >
                  &#9733; {/* Mã Unicode của ngôi sao */}
                </span>
              ))}
            </div>
            {ratingSuccess && <p className="success-message">{ratingSuccess}</p>}
            {ratingError && <p className="error-message">{ratingError}</p>}
          </div>
        ) : (
          <p>Please <Link to="/login">login</Link> to rate this movie.</p>
        )}
      </div>

      <div className="comments-section">
        <h3>Comments</h3>
        {commentLoading && <p>Loading comments...</p>}
        {commentError && <p className="error-message">{commentError}</p>}
        {!commentLoading && comments.length === 0 && <p>No comments yet.</p>}

        {/* Form thêm bình luận */}
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