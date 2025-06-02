import React, { useState } from 'react'; // Bỏ useEffect vì không dùng
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function UpdateMoviePage() {
  const { isAuthenticated, isAdmin, token } = useAuth();
  const navigate = useNavigate();

  const [searchTitle, setSearchTitle] = useState(''); // State để tìm phim theo tên
  const [movieToUpdate, setMovieToUpdate] = useState(null); // Phim được tìm thấy để cập nhật
  const [movieFound, setMovieFound] = useState(false); // Trạng thái tìm thấy phim

  // States cho form cập nhật
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [genre, setGenre] = useState('');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Chuyển hướng nếu không phải admin
  if (!isAuthenticated || !isAdmin) {
    if (!loading) {
      setTimeout(() => {
        navigate('/');
      }, 0);
    }
    return (
        <div className="container">
            <p className="error-message">Access Denied. You must be an administrator to update movies.</p>
            <p>Redirecting to homepage...</p>
        </div>
    );
  }

  // --- Loại bỏ các hàm fetchMovie, fetchComments, fetchUserRating và các useEffect gọi chúng ---
  // Các hàm này thuộc về MovieDetailPage, không phải UpdateMoviePage
  // useEffect(fetchMovie, [fetchMovie]); // Loại bỏ
  // useEffect(fetchComments, [fetchComments]); // Loại bỏ
  // useEffect(fetchUserRating, [fetchUserRating]); // Loại bỏ


  // Hàm tìm phim theo tên
  const handleSearchMovie = async (event) => {
    event.preventDefault();
    setMovieToUpdate(null);
    setMovieFound(false);
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Backend của bạn có API GET /api/movies?search={title} để tìm kiếm
      const response = await axios.get(`http://localhost:8000/api/movies?search=${encodeURIComponent(searchTitle)}`);
      
      if (response.data && response.data.length > 0) {
        // Lấy phim đầu tiên tìm thấy (nếu có nhiều phim trùng tên)
        const found = response.data[0]; 
        setMovieToUpdate(found);
        setMovieFound(true);

        // Điền dữ liệu hiện có vào form
        setTitle(found.title || '');
        setDescription(found.description || '');
        setReleaseDate(found.releaseDate ? found.releaseDate.split('T')[0] : ''); // Định dạng ngày cho input type="date"
        setGenre(found.genre || '');
        setDirector(found.director || '');
        setCast(found.cast ? found.cast.join(', ') : '');
        setPosterUrl(found.posterUrl || '');
        setTrailerUrl(found.trailerUrl || '');

        setSuccess('Movie found! You can now update or delete its details.');
      } else {
        setError('Movie not found with that title.');
      }
    } catch (err) {
      console.error('Error searching movie:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to search movie.');
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý cập nhật phim
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

      const originalTitle = movieToUpdate.title; 
      const response = await axios.put(
        `http://localhost:8000/api/movies/by-name/${encodeURIComponent(originalTitle)}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  // Hàm xử lý xóa phim
  const handleDeleteMovie = async () => {
    if (!window.confirm(`Are you sure you want to delete the movie "${movieToUpdate.title}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const movieTitleToDelete = movieToUpdate.title; 
      const response = await axios.delete(
        `http://localhost:8000/api/movies/by-name/${encodeURIComponent(movieTitleToDelete)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(response.data.message || 'Movie deleted successfully!');
      console.log('Movie deleted:', response.data);
      setSearchTitle('');
      setMovieToUpdate(null);
      setMovieFound(false);

      navigate('/'); 

    } catch (err) {
      console.error('Error deleting movie:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to delete movie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Update/Delete Movie (Admin Only)</h2>

      {/* Form tìm kiếm phim */}
      <form className="auth-form" onSubmit={handleSearchMovie}>
        <h3>1. Find Movie to Update or Delete</h3>
        {error && !movieFound && <p className="error-message">{error}</p>}
        {success && movieFound && <p className="success-message">{success}</p>}
        <div className="form-group">
          <label htmlFor="searchTitle">Movie Title to Find:</label>
          <input 
            type="text" 
            id="searchTitle" 
            value={searchTitle} 
            onChange={(e) => setSearchTitle(e.target.value)} 
            required 
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Find Movie'}
        </button>
      </form>

      {/* Form cập nhật phim và nút xóa (chỉ hiển thị khi đã tìm thấy phim) */}
      {movieFound && (
        <form className="auth-form" onSubmit={handleUpdateMovie} style={{ marginTop: '40px' }}>
          <h3>2. Update or Delete Movie "{movieToUpdate.title}"</h3>
          {error && movieFound && <p className="error-message">{error}</p>}
          {success && movieFound && <p className="success-message">{success}</p>}

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
              {loading ? 'Deleting...' : 'Delete Movie'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default UpdateMoviePage;