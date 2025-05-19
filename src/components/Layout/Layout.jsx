import React, { useEffect, useState } from 'react';
import Header from '../Header/Header';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import './Layout.css';

const Layout = ({ children, theme, toggleTheme }) => {
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserEmail(user.email);
      else setUserEmail(null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        Cookies.remove('userToken');
        navigate('/');
      })
      .catch((error) => console.error('Logout error:', error.message));
  };

  return (
    <div className="layout container">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        userEmail={userEmail}
        onLogout={handleLogout}
      />
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
