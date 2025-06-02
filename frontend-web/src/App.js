import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';
import MovieList from './components/MovieList';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MovieDetailPage from './pages/MovieDetailPage';
import AddMoviePage from './pages/AddMoviePage';
import UpdateMoviePage from './pages/UpdateMoviePage'; // Import UpdateMoviePage

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const { user, isAuthenticated, logout, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setCurrentSearch(searchTerm);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="App" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <header className="App-header">
          <h2>Loading application...</h2>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Movie Review Website</Link>
        </h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search movies by title or genre..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
          />
          <button onClick={handleSearchSubmit}>Search</button>
        </div>
        <nav className="main-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            {isAuthenticated ? (
              <>
                {isAdmin && (
                    <>
                        <li><Link to="/add-movie">Add Movie</Link></li>
                        <li><Link to="/update-movie">Update Movie</Link></li> {/* Thêm Link này */}
                    </>
                )}
                <li><span style={{ color: '#ccc', cursor: 'default' }}>Welcome, {user.name}</span></li>
                <li><button onClick={handleLogout} className="nav-button">Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<MovieList searchKeyword={currentSearch} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/add-movie" element={<AddMoviePage />} />
          <Route path="/update-movie" element={<UpdateMoviePage />} /> {/* Thêm Route này */}
        </Routes>
      </main>
    </div>
  );
}

export default App;