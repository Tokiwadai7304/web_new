import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './MovieList.css'; // Đảm bảo import tệp CSS này

function MovieList({ searchKeyword }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortBy, setSortBy] = useState('releaseDate'); 
  const [sortOrder, setSortOrder] = useState('desc');    

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      // console.log(`Frontend: Fetching movies. Search: '${searchKeyword}', SortBy: '${sortBy}', SortOrder: '${sortOrder}'`);

      try {
        const params = new URLSearchParams();

        if (searchKeyword) {
          params.append('search', searchKeyword);
        }
        
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);
        
        const apiUrl = `http://localhost:8000/api/movies?${params.toString()}`;
        
        // console.log("Frontend: Calling API URL:", apiUrl); 
        
        const response = await axios.get(apiUrl);
        // console.log("Frontend: API Response Status:", response.status);
        // console.log("Frontend: API Response Data (first 5 movies):", response.data.slice(0,5)); 
        
        setMovies(response.data);
      } catch (err) {
        // console.error('Frontend: Error fetching movies:', err.response || err.message || err);
        setError('Failed to load movie list. Please check connection or search term.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [searchKeyword, sortBy, sortOrder]); 

  const handleSortByChange = (event) => {
    // console.log("Frontend: SortBy changed to:", event.target.value);
    setSortBy(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    // console.log("Frontend: SortOrder changed to:", event.target.value);
    setSortOrder(event.target.value);
  };

  if (loading) {
    return <div className="movie-list-container">Loading movies...</div>;
  }

  if (error) {
    return <div className="movie-list-container error-message">{error}</div>;
  }

  return (
    <div className="movie-list-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Movie List</h2>
        {/* Điều khiển sắp xếp sử dụng className từ MovieList.css */}
        <div className="sorting-controls sorting-controls-container"> {/* Áp dụng class cho container */}
          <div>
            <label htmlFor="sort-by" className="sort-label">Sort By: </label> {/* Áp dụng class cho label */}
            <select id="sort-by" value={sortBy} onChange={handleSortByChange} className="sort-select"> {/* Áp dụng class cho select */}
              <option value="releaseDate">Release Date</option>
              <option value="title">Title</option>
              <option value="averageRating">Rating</option>
            </select>
          </div>
          <div>
            <label htmlFor="sort-order" className="sort-label">Order: </label> {/* Áp dụng class cho label */}
            <select id="sort-order" value={sortOrder} onChange={handleSortOrderChange} className="sort-select"> {/* Áp dụng class cho select */}
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {movies.length === 0 ? (
        <p>No movies found for your search or filter criteria.</p>
      ) : (
        <div className="movie-list">
          {movies.map(movie => (
            <Link to={`/movies/${movie._id}`} key={movie._id} className="movie-list-item-link">
              <div className="movie-list-item">
                <div className="movie-poster-wrapper">
                  {movie.posterUrl && <img src={movie.posterUrl} alt={movie.title} className="movie-poster-list" />}
                </div>
                <div className="movie-info-list">
                  <h3>{movie.title}</h3>
                  <p><strong>Rating:</strong> {movie.averageRating != null ? `${parseFloat(movie.averageRating).toFixed(1)}/5` : 'N/A'} ({movie.numberOfRatings || 0} votes)</p>
                  <p><strong>Genre:</strong> {movie.genre}</p>
                  <p><strong>Release Date:</strong> {new Date(movie.releaseDate).toLocaleDateString()}</p>
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