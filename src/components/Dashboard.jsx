import React, { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import Layout from './Layout';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    count: 0,
    totalMinutes: 0,
    lastEntryDate: null,
  });
  const [chartData, setChartData] = useState([]);
  const [darkTheme, setDarkTheme] = useState(false);

  // Завантаження даних
  const fetchStats = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'time_entries'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map((doc) => doc.data());

    const count = entries.length;
    let totalMinutes = 0;
    let lastDate = null;
    const dataForChart = [];

    entries.forEach((entry) => {
      const start =
        entry.start_time instanceof Timestamp
          ? entry.start_time.toDate()
          : new Date(entry.start_time);
      const end =
        entry.end_time instanceof Timestamp ? entry.end_time.toDate() : new Date(entry.end_time);

      const duration = (end - start) / 1000 / 60;
      totalMinutes += duration;

      if (!lastDate || end > lastDate) {
        lastDate = end;
      }

      const dateLabel = start.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
      });

      dataForChart.push({
        date: dateLabel,
        duration: Math.round(duration),
      });
    });

    setChartData(dataForChart);

    setStats({
      count,
      totalMinutes: Math.round(totalMinutes),
      lastEntryDate: lastDate ? lastDate.toLocaleString('uk-UA') : '—',
    });
  };

  // Підрахунок середньої сесії
  const avgMinutes = stats.count ? Math.round(stats.totalMinutes / stats.count) : 0;

  // Перемикання теми
  const toggleTheme = () => {
    setDarkTheme((prev) => !prev);
  };

  // Додаємо/видаляємо клас body.dark
  useEffect(() => {
    if (darkTheme) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkTheme]);

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="container">
        <header>
          <h1>Welcome to Dashboard</h1>
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            👤 {auth.currentUser?.email} <button onClick={() => signOut(auth)}>Вийти</button>
          </div>
        </header>

        <h2>Статистика</h2>
        <ul>
          <li
            className="stat-card"
            style={{ backgroundColor: darkTheme ? '#264653' : '#4e8dff', color: '#fff' }}
          >
            📌 Записів часу: <strong>{stats.count}</strong>
          </li>
          <li
            className="stat-card"
            style={{ backgroundColor: darkTheme ? '#2a9d8f' : '#38b000', color: '#fff' }}
          >
            <span title="Сумарна кількість хвилин за всі записи">⏳ Загальна тривалість:</span>{' '}
            <strong>{stats.totalMinutes}</strong> хв
          </li>
          <li
            className="stat-card"
            style={{ backgroundColor: darkTheme ? '#e9c46a' : '#f4a261', color: '#000' }}
          >
            🗓 Останній запис: <strong>{stats.lastEntryDate}</strong>
          </li>
          <li>
            ⚖️ Середня сесія: <strong>{avgMinutes} хв</strong>
          </li>
        </ul>

        {chartData.length > 0 && (
          <>
            <h3 style={{ marginTop: '30px' }}>📈 Графік робочих сесій</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit=" хв" />
                <Tooltip />
                <Line type="monotone" dataKey="duration" stroke="#4e8dff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
