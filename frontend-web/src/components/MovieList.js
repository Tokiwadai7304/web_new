import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MovieList.css'; // Đảm bảo import CSS mới

function MovieList({ searchKeyword }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        let apiUrl = 'http://localhost:8000/api/movies';

        if (searchKeyword) {
          apiUrl = `http://localhost:8000/api/movies?search=${encodeURIComponent(searchKeyword)}`;
        }
        
        const response = await axios.get(apiUrl);
        console.log("Movies data from API:", response.data);
        setMovies(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load movie list. Please check connection or search term.');
        setLoading(false);
        console.error('Error fetching movies:', err);
      }
    };

    fetchMovies();
  }, [searchKeyword]);

  if (loading) {
    return <div className="movie-list-container">Loading movies...</div>;
  }

  if (error) {
    return <div className="movie-list-container error-message">{error}</div>;
  }

  return (
    <div className="movie-list-container">
      <h2>Movie List</h2>
      {movies.length === 0 ? (
        <p>No movies found for your search.</p>
      ) : (
        <div className="movie-list"> {/* Đổi từ movie-grid sang movie-list */}
          {movies.map(movie => (
            <Link to={`/movies/${movie._id}`} key={movie._id} className="movie-list-item-link"> {/* Thêm class mới cho link */}
              <div className="movie-list-item"> {/* Thêm class mới cho item */}
                <div className="movie-poster-wrapper">
                  {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} className="movie-poster-list" />}
                </div>
                <div className="movie-info-list">
                  <h3>{movie.title}</h3>
                  <p><strong>Rating:</strong> {movie.averageRating}/5 ({movie.numberOfRatings || 0} votes)</p>
                  <p><strong>Genre:</strong> {movie.genre}</p>
                  <p><strong>Release Date:</strong> {new Date(movie.releaseDate).toLocaleDateString()}</p>
                  {/* Các thông tin khác như director, description sẽ không hiển thị ở đây */}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default MovieList;