import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom'; // Loại bỏ BrowserRouter ở đây
import { useAuth } from './context/AuthContext';
import './App.css';
import MovieList from './components/MovieList';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MovieDetailPage from './pages/MovieDetailPage'; // Đảm bảo import MovieDetailPage

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate(); // useNavigate bây giờ sẽ hoạt động đúng

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
    // Bỏ BrowserRouter ở đây vì nó đã được đặt ở index.js
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
        </Routes>
      </main>
    </div>
  );
}

export default App;