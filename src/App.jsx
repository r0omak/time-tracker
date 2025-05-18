import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

import Login from './components/AuthForm/Login';
import Register from './components/AuthForm/Register';
import Dashboard from './components/Dashboard/Dashboard';
import TimeTracker from './components/TimeTracker/TimeTracker';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Слідкуємо за зміною статусу аутентифікації
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: 40 }}>Завантаження...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Головна сторінка: редірект на Dashboard, якщо користувач авторизований, або на Login */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />

        {/* Сторінки реєстрації та логіну доступні лише неавторизованим */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

        {/* Захищені маршрути, доступні лише авторизованим */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/tracker" element={user ? <TimeTracker /> : <Navigate to="/login" />} />

        {/* Всі інші шляхи - редірект на головну */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
