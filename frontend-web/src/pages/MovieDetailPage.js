import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

function MovieDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, token, user, isAdmin } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [commentLoading, setCommentLoading] = useState(false);

  const [userRating, setUserRating] = useState(0);
  const [userRatingId, setUserRatingId] = useState(null); 
  const [ratingError, setRatingError] = useState(null);
  const [ratingSuccess, setRatingSuccess] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);

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
  }, [fetchMovie]);

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

  const fetchUserRating = useCallback(async () => {
    if (!isAuthenticated || !user) {
        setUserRating(0);
        setUserRatingId(null); 
        return;
    }
    try {
        const response = await axios.get(`http://localhost:8000/api/ratings?movieId=${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // Backend bây giờ trả về userId dưới dạng chuỗi ID
        const currentUserRatingData = response.data.find(r => r.userId === user.id); 
        setUserRating(currentUserRatingData ? currentUserRatingData.rating : 0);
        setUserRatingId(currentUserRatingData ? currentUserRatingData._id : null); 
    } catch (err) {
        console.error('Error fetching user rating:', err);
        setUserRating(0);
        setUserRatingId(null);
    }
  }, [id, isAuthenticated, token, user]);

  useEffect(() => {
    fetchUserRating();
  }, [fetchUserRating]);

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

  const handleRateMovie = async (ratingValue) => {
    if (!isAuthenticated) {
        setRatingError('Please login to rate movies.');
        return;
    }
    if (ratingValue < 1 || ratingValue > 5) {
        setRatingError('Rating must be an integer between 1 and 5.');
        return;
    }
    setRatingError(null);
    setRatingSuccess(null);
    setRatingLoading(true);

    try {
        await axios.post(
            'http://localhost:8000/api/ratings',
            { movieId: id, rating: ratingValue },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        setRatingSuccess('Rating submitted successfully!');
        setUserRating(ratingValue);
        fetchMovie();
        fetchUserRating(); 
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to submit rating.');
      console.error('Error submitting rating:', err);
    } finally {
        setRatingLoading(false);
    }
  };

  const handleDeleteComment = async (commentId, commentAuthorId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    setCommentLoading(true);
    setCommentError(null);

    try {
      await axios.delete(
        `http://localhost:8000/api/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchComments();
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to delete comment.');
      console.error('Error deleting comment:', err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!userRatingId || !window.confirm("Are you sure you want to delete your rating?")) {
      return;
    }
    setRatingLoading(true);
    setRatingError(null);
    setRatingSuccess(null);

    try {
      await axios.delete(
        `http://localhost:8000/api/ratings/${userRatingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRatingSuccess('Your rating has been deleted successfully!');
      setUserRating(0);
      setUserRatingId(null); 
      fetchMovie(); 
    } catch (err) {
      setRatingError(err.response?.data?.message || 'Failed to delete rating.');
      console.error('Error deleting rating:', err);
    } finally {
      setRatingLoading(false);
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

        {isAuthenticated ? (
          <div className="user-rating-form">
            <p>Your rating: {userRating > 0 ? `${userRating}/5` : 'Not rated yet'}</p>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => ( // Thang điểm 5
                <span
                  key={star}
                  className={`star ${star <= userRating ? 'selected' : ''}`}
                  onClick={() => handleRateMovie(star)}
                >
                  &#9733;
                </span>
              ))}
            </div>
            {ratingSuccess && <p className="success-message">{ratingSuccess}</p>}
            {ratingError && <p className="error-message">{ratingError}</p>}
            {userRatingId && ( // Điều kiện hiển thị nút xóa
                <button
                  className="delete-rating-button"
                  onClick={handleDeleteRating}
                  disabled={ratingLoading}
                >
                  {ratingLoading ? 'Deleting...' : 'Delete My Rating'}
                </button>
            )}
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

        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment._id} className="comment-item">
              <p className="comment-author">
                <strong>{comment.name || 'Anonymous'}</strong>{' '}
                <span className="comment-date">({new Date(comment.createdAt).toLocaleDateString()})</span>
                {/* Nút xóa bình luận */}
                {isAuthenticated && (isAdmin || (user && user.id === comment.userId)) && ( // Điều kiện hiển thị
                  <button
                    className="delete-comment-button"
                    onClick={() => handleDeleteComment(comment._id, comment.userId)}
                    disabled={commentLoading}
                  >
                    Delete
                  </button>
                )}
              </p>
              <p className="comment-content">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MovieDetailPage;