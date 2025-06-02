import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link
import './MovieList.css';

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
        <div className="movie-grid">
          {movies.map(movie => (
            // Bọc movie-card trong Link
            <Link to={`/movies/${movie._id}`} key={movie._id} className="movie-card-link"> 
              <div className="movie-card">
                {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />}
                <h3>{movie.title}</h3>
                <p><strong>Genre:</strong> {movie.genre}</p>
                <p><strong>Director:</strong> {movie.director}</p>
                <p><strong>Release Date:</strong> {new Date(movie.releaseDate).toLocaleDateString()}</p>
                <p>{movie.description}</p>
                {/* Có thể hiển thị rating trung bình ở đây nếu muốn */}
                {movie.averageRating !== undefined && <p>Rating: {movie.averageRating}/5 ({movie.numberOfRatings || 0} votes)</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default MovieList;