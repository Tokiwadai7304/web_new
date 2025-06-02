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
        <div className="header-left"> {/* Container cho Logo và Menu */}
          <div className="logo">
            <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>LOGO</Link> {/* Thay đổi thành LOGO */}
          </div>
          <div className="menu-icon">☰</div> {/* Biểu tượng Menu (Hamburger) */}
        </div>

        <div className="header-center"> {/* Container cho Search Bar */}
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
        </div>

        <div className="header-right"> {/* Container cho Login/Sign up và Logout */}
          <nav className="main-nav">
            <ul>
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                      <>
                          <li><Link to="/add-movie">Add Movie</Link></li>
                          <li><Link to="/update-movie">Update Movie</Link></li>
                      </>
                  )}
                  <li><span style={{ color: '#ccc', cursor: 'default' }}>Welcome, {user.name}</span></li>
                  <li><button onClick={handleLogout} className="nav-button">Logout</button></li>
                </>
              ) : (
                <>
                  {/* Thay thế nút Login/Register bằng một nút duy nhất như trong wireframe */}
                  <li><Link to="/login" className="login-signup-button">Login/Sign up</Link></li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<MovieList searchKeyword={currentSearch} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/add-movie" element={<AddMoviePage />} />
          <Route path="/update-movie" element={<UpdateMoviePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;