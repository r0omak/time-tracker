import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ theme, toggleTheme, userEmail, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="header">
      <div
        className="header-logo"
        onClick={() => navigate('/dashboard')}
        style={{ cursor: 'pointer' }}
      >
        ⏱ <span>TimeTracker</span>
      </div>

      <nav className="header-nav">
        <button
          className={location.pathname === '/dashboard' ? 'active' : ''}
          onClick={() => navigate('/dashboard')}
          type="button"
        >
          Dashboard
        </button>
        <button
          className={location.pathname === '/tracker' ? 'active' : ''}
          onClick={() => navigate('/tracker')}
          type="button"
        >
          Time Tracker
        </button>
        <button
          className={location.pathname === '/calendar' ? 'active' : ''}
          onClick={() => navigate('/calendar')}
        >
          Календар
        </button>

        {userEmail && (
          <div className="user-info">
            <span className="user-icon" role="img" aria-label="User">
              👤
            </span>
            <span className="user-email">{userEmail}</span>
            <button className="logout-btn" onClick={onLogout} type="button">
              Вийти
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
