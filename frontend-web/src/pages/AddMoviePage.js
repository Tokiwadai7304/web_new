import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // Để lấy token và kiểm tra quyền admin
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Để dùng các CSS chung

function AddMoviePage() {
  const { isAuthenticated, isAdmin, token } = useAuth(); // Lấy thông tin xác thực và vai trò
  const navigate = useNavigate();

  // State cho các trường của form phim
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [genre, setGenre] = useState('');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState(''); // Sẽ xử lý thành mảng sau
  const [posterUrl, setPosterUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Chuyển hướng nếu không phải admin hoặc chưa đăng nhập
  if (!isAuthenticated || !isAdmin) {
    // Có thể chuyển hướng đến trang 403 Forbidden hoặc trang chủ
    // Tùy theo yêu cầu của bạn, hiện tại tôi sẽ chuyển hướng về trang chủ
    if (!loading) { // Chỉ chuyển hướng nếu không đang tải
      setTimeout(() => { // Dùng setTimeout để tránh warning khi render
        navigate('/');
      }, 0);
    }
    return (
        <div className="container">
            <p className="error-message">Access Denied. You must be an administrator to add movies.</p>
            <p>Redirecting to homepage...</p>
        </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const movieData = {
        title,
        description,
        releaseDate,
        genre,
        director,
        cast: cast.split(',').map(item => item.trim()), // Chuyển chuỗi cast thành mảng
        posterUrl,
        trailerUrl,
      };

      // Gửi yêu cầu POST đến API thêm phim của backend
      // API movieRouter.js có movieRouter.post('/', ...)
      // Trong index.js, nó được mount tại app.use('/api/movies', movieRouter);
      // Vậy API đầy đủ sẽ là http://localhost:8000/api/movies
      const response = await axios.post(
        'http://localhost:8000/api/movies',
        movieData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Gửi token xác thực (cần quyền admin)
          },
        }
      );

      setSuccess(response.data.message || 'Movie added successfully!');
      console.log('Movie added:', response.data);
      // Xóa form sau khi thêm thành công
      setTitle('');
      setDescription('');
      setReleaseDate('');
      setGenre('');
      setDirector('');
      setCast('');
      setPosterUrl('');
      setTrailerUrl('');

    } catch (err) {
      console.error('Error adding movie:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to add movie. Check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Add New Movie (Admin Only)</h2>
      <form className="auth-form" onSubmit={handleSubmit}> {/* Dùng lại auth-form CSS */}
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="5" required></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="releaseDate">Release Date:</label>
          <input type="date" id="releaseDate" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="genre">Genre:</label>
          <input type="text" id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="director">Director:</label>
          <input type="text" id="director" value={director} onChange={(e) => setDirector(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="cast">Cast (comma-separated):</label>
          <input type="text" id="cast" value={cast} onChange={(e) => setCast(e.target.value)} placeholder="Actor1, Actor2, Actor3" required />
        </div>
        <div className="form-group">
          <label htmlFor="posterUrl">Poster URL:</label>
          <input type="url" id="posterUrl" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="trailerUrl">Trailer URL:</label>
          <input type="url" id="trailerUrl" value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} required />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Adding Movie...' : 'Add Movie'}
        </button>
      </form>
    </div>
  );
}

export default AddMoviePage;