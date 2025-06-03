import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import '../App.css';

function UpdateMoviePage() {
  const { isAuthenticated, isAdmin, token } = useAuth();
  const navigate = useNavigate();
  const { movieId } = useParams(); 

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [genre, setGenre] = useState('');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');

  const [loading, setLoading] = useState(false); 
  const [formLoading, setFormLoading] = useState(true); 
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchMovieToUpdate = useCallback(async () => {
    if (!movieId) {
      setError("No movie ID provided.");
      setFormLoading(false);
      return;
    }
    setFormLoading(true);
    setError(null);
    try {

      const response = await axios.get(`http://localhost:8000/api/movies/${movieId}`);
      const movieData = response.data;
      if (movieData) {
        setTitle(movieData.title || '');
        setDescription(movieData.description || '');
        setReleaseDate(movieData.releaseDate ? movieData.releaseDate.split('T')[0] : '');
        setGenre(movieData.genre || '');
        setDirector(movieData.director || '');
        setCast(movieData.cast ? movieData.cast.join(', ') : '');
        setPosterUrl(movieData.posterUrl || '');
        setTrailerUrl(movieData.trailerUrl || '');
      } else {
        setError('Movie not found with this ID.');
      }
    } catch (err) {
      console.error('Error fetching movie for update:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to fetch movie data.');
    } finally {
      setFormLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    if (isAdmin && movieId) { 
        fetchMovieToUpdate();
    } else if (!isAdmin) {
        // Xử lý sau
    }
  }, [isAdmin, movieId, fetchMovieToUpdate]);

  if (!isAuthenticated || !isAdmin) {
    setTimeout(() => {
      navigate('/');
    }, 0);
    return (
        <div className="container">
            <p className="error-message">Access Denied. You must be an administrator to update movies.</p>
            <p>Redirecting to homepage...</p>
        </div>
    );
  }
  
  const handleUpdateMovie = async (event) => {
    event.preventDefault();
    setLoading(true); 
    setError(null);
    setSuccess(null);

    try {
      const updateData = {
        title,
        description,
        releaseDate,
        genre,
        director,
        cast: cast.split(',').map(item => item.trim()),
        posterUrl,
        trailerUrl,
      };
      
      console.log("Frontend: Sending updateData:", JSON.stringify(updateData, null, 2));

      const response = await axios.put(
        `http://localhost:8000/api/movies/${movieId}`, 
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess(response.data.message || 'Movie updated successfully!');
      console.log('Movie updated:', response.data);

    } catch (err) {
      console.error('Error updating movie:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to update movie. Check your input.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMovie = async () => {
    const currentMovieTitle = title; 

    if (!window.confirm(`Are you sure you want to delete the movie "${currentMovieTitle}"?`)) {
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await axios.delete(
        `http://localhost:8000/api/movies/by-name/${encodeURIComponent(currentMovieTitle)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(response.data.message || 'Movie deleted successfully!');
      console.log('Movie deleted:', response.data);
      navigate('/'); 
    } catch (err) {
      console.error('Error deleting movie:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to delete movie.');
    } finally {
      setLoading(false);
    }
  };
  
  if (formLoading && movieId) { 
    return (
        <div className="container">
            <p>Loading movie data for update...</p>
        </div>
    );
  }
  
  if (!movieId && isAdmin) { 
    return (
        <div className="container">
            <p className="error-message">No movie selected for update. Please access this page via a movie's detail page.</p>
            <Link to="/">Go to Homepage</Link>
        </div>
    );
  }

  return (
    <div className="container">
      <h2>Update Movie: {title || "Loading..."}</h2> 

      { movieId && ( 
        <form className="auth-form" onSubmit={handleUpdateMovie} style={{ marginTop: '20px' }}>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          <div className="form-group">
            <label htmlFor="updateTitle">Title:</label>
            <input type="text" id="updateTitle" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="updateDescription">Description:</label>
            <textarea id="updateDescription" value={description} onChange={(e) => setDescription(e.target.value)} rows="5" required></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="updateReleaseDate">Release Date:</label>
            <input type="date" id="updateReleaseDate" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="updateGenre">Genre:</label>
            <input type="text" id="updateGenre" value={genre} onChange={(e) => setGenre(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="updateDirector">Director:</label>
            <input type="text" id="updateDirector" value={director} onChange={(e) => setDirector(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="updateCast">Cast (comma-separated):</label>
            <input type="text" id="updateCast" value={cast} onChange={(e) => setCast(e.target.value)} placeholder="Actor1, Actor2, Actor3" required />
          </div>
          <div className="form-group">
            <label htmlFor="updatePosterUrl">Poster URL:</label>
            <input type="url" id="updatePosterUrl" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="updateTrailerUrl">Trailer URL:</label>
            <input type="url" id="updateTrailerUrl" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} required />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Updating Movie...' : 'Update Movie'}
            </button>
            <button type="button" onClick={handleDeleteMovie} disabled={loading} className="delete-button">
              {loading ? 'Deleting...' : 'Delete This Movie'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default UpdateMoviePage;