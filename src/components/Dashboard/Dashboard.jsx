import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import Layout from '../Layout/Layout';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

import './Dashboard.css';

const Dashboard = ({ theme }) => {
  // Визначаємо, чи темна тема
  const darkTheme = theme === 'dark';

  const [stats, setStats] = useState({
    count: 0,
    totalMinutes: 0,
    lastEntryDate: null,
  });

  const [chartData, setChartData] = useState([]);

  // Завантаження даних з Firestore
  const fetchStats = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'time_entries'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map((doc) => doc.data());

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

      const duration = (end - start) / 1000 / 60; // хвилини
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

    setStats({
      count: entries.length,
      totalMinutes: Math.round(totalMinutes),
      lastEntryDate: lastDate ? lastDate.toLocaleString('uk-UA') : '—',
    });

    setChartData(dataForChart);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const avgMinutes = stats.count ? Math.round(stats.totalMinutes / stats.count) : 0;

  return (
    <Layout>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Welcome to Dashboard</h1>
        </header>

        <section className="stats-section">
          <h2>Статистика</h2>
          <ul className="stats-list">
            <li className={`stat-card ${darkTheme ? 'dark-blue' : 'blue'}`}>
              📌 Записів часу: <strong>{stats.count}</strong>
            </li>
            <li className={`stat-card ${darkTheme ? 'dark-green' : 'green'}`}>
              ⏳ Загальна тривалість: <strong>{stats.totalMinutes}</strong> хв
            </li>
            <li className={`stat-card ${darkTheme ? 'dark-yellow' : 'orange'}`}>
              🗓 Останній запис: <strong>{stats.lastEntryDate}</strong>
            </li>
            <li className="stat-card">
              ⚖️ Середня сесія: <strong>{avgMinutes} хв</strong>
            </li>
          </ul>
        </section>

        {chartData.length > 0 && (
          <section className="chart-section">
            <h3>📈 Графік робочих сесій</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit=" хв" />
                <Tooltip />
                <Line type="monotone" dataKey="duration" stroke="#4e8dff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
