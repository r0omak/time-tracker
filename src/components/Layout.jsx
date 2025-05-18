import React from 'react';
import Header from './Header';
import './Layout.css'; // можна для обгортки

const Layout = ({ children }) => {
  return (
    <div className="layout container">
      <Header />
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
