import React, { useState, useEffect } from 'react';
import { db, collection, addDoc, getDocs, query, where, orderBy, Timestamp } from '../firebase';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';

const TimeTracker = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [darkTheme, setDarkTheme] = useState(false);

  const navigate = useNavigate();

  // Завантажуємо тему з localStorage при ініціалізації
  useEffect(() => {
    const storedTheme = localStorage.getItem('darkTheme');
    setDarkTheme(storedTheme === 'true');
  }, []);

  // Зберігаємо тему в localStorage та оновлюємо клас body
  useEffect(() => {
    localStorage.setItem('darkTheme', darkTheme);
    if (darkTheme) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkTheme]);

  const toggleTheme = () => {
    setDarkTheme((prev) => !prev);
  };

  const fetchTimeEntries = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }
    const q = query(
      collection(db, 'time_entries'),
      where('userId', '==', user.uid),
      orderBy('start_time', 'desc'),
    );
    const querySnapshot = await getDocs(q);
    const entries = querySnapshot.docs.map((doc) => doc.data());
    setTimeEntries(entries);
  };

  const handleStart = () => {
    if (!startTime) {
      const now = new Date();
      setStartTime(now);
      localStorage.setItem('startTime', now.toISOString());
    }
    setIsRunning(true);
    setIsPaused(false);
    localStorage.setItem('isRunning', 'true');
    localStorage.setItem('isPaused', 'false');
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
    localStorage.setItem('elapsedTime', elapsedTime.toString());
    localStorage.setItem('isRunning', 'false');
    localStorage.setItem('isPaused', 'true');
  };

  const handleStopAndSave = async () => {
    const user = auth.currentUser;
    if (user && startTime) {
      const end = new Date();
      await addDoc(collection(db, 'time_entries'), {
        userId: user.uid,
        title: title || 'Без назви',
        start_time: Timestamp.fromDate(new Date(startTime)),
        end_time: Timestamp.fromDate(end),
      });

      setStartTime(null);
      setTitle('');
      setElapsedTime(0);
      setIsRunning(false);
      setIsPaused(false);

      localStorage.removeItem('startTime');
      localStorage.removeItem('elapsedTime');
      localStorage.removeItem('isRunning');
      localStorage.removeItem('isPaused');

      fetchTimeEntries();
    }
  };

  const formatTime = (timestampOrDate) => {
    const date =
      timestampOrDate instanceof Timestamp ? timestampOrDate.toDate() : new Date(timestampOrDate);
    return date.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatElapsedTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    fetchTimeEntries();

    const storedStart = localStorage.getItem('startTime');
    const storedElapsed = localStorage.getItem('elapsedTime');
    const storedRunning = localStorage.getItem('isRunning');
    const storedPaused = localStorage.getItem('isPaused');

    if (storedStart) {
      setStartTime(new Date(storedStart));
    }

    if (storedElapsed) {
      setElapsedTime(Number(storedElapsed));
    }

    setIsRunning(storedRunning === 'true');
    setIsPaused(storedPaused === 'true');
  }, []);

  return (
    <Layout>
      <div className={`container ${darkTheme ? 'dark' : 'light'}`} style={{ padding: '20px' }}>
        <h2>Тайм-трекер</h2>

        <input
          type="text"
          placeholder="Назва запису"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: '8px',
            marginBottom: '10px',
            width: '300px',
            color: darkTheme ? '#e0e0e0' : '#000',
            backgroundColor: darkTheme ? '#333' : '#fff',
            border: '1px solid',
            borderColor: darkTheme ? '#555' : '#ccc',
          }}
        />
        <br />

        {!isRunning && !isPaused && <button onClick={handleStart}>Start</button>}
        {isRunning && <button onClick={handlePause}>Pause</button>}
        {!isRunning && isPaused && <button onClick={handleStart}>Resume</button>}
        {(isRunning || isPaused) && (
          <button onClick={handleStopAndSave} style={{ marginLeft: '10px' }}>
            Stop & Save
          </button>
        )}

        {(isRunning || isPaused) && (
          <p style={{ fontSize: '18px', marginTop: '10px', color: darkTheme ? '#e0e0e0' : '#000' }}>
            Час з початку: <strong>{formatElapsedTime(elapsedTime)}</strong>
          </p>
        )}

        <h3 style={{ color: darkTheme ? '#e0e0e0' : '#000' }}>Історія</h3>
        <ul style={{ color: darkTheme ? '#e0e0e0' : '#000' }}>
          {timeEntries.map((entry, index) => (
            <li key={index}>
              <strong>{entry.title || 'Без назви'}:</strong> {formatTime(entry.start_time)} —{' '}
              {formatTime(entry.end_time)}
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default TimeTracker;
