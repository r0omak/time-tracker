import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import Cookies from 'js-cookie';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (auth.currentUser) {
      setUserEmail(auth.currentUser.email);
    }
  }, [auth.currentUser]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        Cookies.remove('userToken');
        navigate('/');
      })
      .catch((error) => {
        console.error('Logout error:', error.message);
      });
  };

  return (
    <header className="header">
      <div className="header-logo" onClick={() => navigate('/dashboard')}>
        ⏱ <span>TimeTracker</span>
      </div>

      <nav className="header-nav">
        <button
          className={location.pathname === '/dashboard' ? 'active' : ''}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </button>
        <button
          className={location.pathname === '/tracker' ? 'active' : ''}
          onClick={() => navigate('/tracker')}
        >
          Time Tracker
        </button>

        {userEmail && (
          <span className="profile-info">
            👤 {userEmail}
            <button onClick={handleLogout} className="logout-btn">
              Вийти
            </button>
          </span>
        )}

        <button onClick={toggleTheme} className="theme-toggle-btn">
          {theme === 'light' ? '🌙 Темна' : '☀️ Світла'}
        </button>
      </nav>
    </header>
  );
};

export default Header;
