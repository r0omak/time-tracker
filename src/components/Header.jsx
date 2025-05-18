import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import Cookies from 'js-cookie';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = auth.currentUser?.email;

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
      <div className="header-container">
        <div className="header-logo" onClick={() => navigate('/dashboard')}>
          ⏱ <span>TimeTracker</span>
        </div>

        <nav className="header-nav">
          <button
            className={`nav-button ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-button ${location.pathname === '/tracker' ? 'active' : ''}`}
            onClick={() => navigate('/tracker')}
          >
            Time Tracker
          </button>
        </nav>

        {/* Профіль користувача з email і кнопкою виходу */}
        {userEmail && (
          <div className="user-profile">
            👤 <span className="user-email">{userEmail}</span>
            <button className="logout-button" onClick={handleLogout}>
              Вийти
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
