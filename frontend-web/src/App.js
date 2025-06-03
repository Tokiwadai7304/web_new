import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';
import MovieList from './components/MovieList';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MovieDetailPage from './pages/MovieDetailPage';
import AddMoviePage from './pages/AddMoviePage';
import UpdateMoviePage from './pages/UpdateMoviePage';
import BackToTopButton from './components/BackToTopButton'; // IMPORT COMPONENT MỚI

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const { user, isAuthenticated, logout, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setCurrentSearch(searchTerm);
    if (window.innerWidth <= 800) { 
      setShowSearchBar(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSearchBar = () => { 
    setShowSearchBar(prev => !prev);
  };

  const handleLogoClick = () => {
    setSearchTerm('');     
    setCurrentSearch('');  
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
        <div className="header-left">
          <div className="logo" onClick={handleLogoClick}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>LOGO</Link>
          </div>
        </div>

        <div className="header-right-top">
          <div className="search-icon" onClick={toggleSearchBar}>
            🔍 
          </div>
          <nav className="main-nav">
            <ul>
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                      <>
                          <li><Link to="/add-movie">Add Movie</Link></li>
                          {/* Nút Update Movie đã được chuyển vào MovieDetailPage */}
                      </>
                  )}
                  <li><span style={{ color: '#ccc', cursor: 'default' }}>Welcome, {user.name}</span></li>
                  <li><button onClick={handleLogout} className="nav-button">Logout</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="login-signup-button">Login/Sign up</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>
        
        {showSearchBar && (
          <div className="search-bar-mobile">
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
        )}

        <div className="search-bar-desktop">
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

      </header>
      <main>
        <Routes>
          <Route path="/" element={<MovieList searchKeyword={currentSearch} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/add-movie" element={<AddMoviePage />} />
          <Route path="/update-movie/:movieId" element={<UpdateMoviePage />} />
        </Routes>
      </main>
      
      {/* THÊM COMPONENT BackToTopButton VÀO ĐÂY */}
      <BackToTopButton />
    </div>
  );
}

export default App;