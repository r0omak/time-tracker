import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './AuthForm.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Крок 1: створення користувача
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('👉 UID:', user.uid);
      console.log('👉 Email:', user.email);

      // Крок 2: запис у Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email || email, // fallback на випадок затримки
        role: 'employee',
      });

      alert('✅ Реєстрація успішна!');
      navigate('/login');
    } catch (error) {
      console.error('❌ Помилка реєстрації:', error);
      alert('Помилка: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleRegister} className="auth-form-container">
      <h2>Реєстрація</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Зареєструватися</button>
      <p>
        Вже маєте акаунт? <a href="/login">Увійти</a>
      </p>
    </form>
  );
};

export default Register;
