import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where, doc, getDoc, Timestamp } from 'firebase/firestore';
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

const Dashboard = () => {
  const [stats, setStats] = useState({
    count: 0,
    totalMinutes: 0,
    lastEntryDate: null,
  });
  const [chartData, setChartData] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // Отримуємо роль
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const role = userDoc.exists() ? userDoc.data().role : 'employee';
    setUserRole(role);

    const entriesQuery =
      role === 'admin'
        ? query(collection(db, 'time_entries'))
        : query(collection(db, 'time_entries'), where('userId', '==', user.uid));

    const snapshot = await getDocs(entriesQuery);
    const entries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    let totalMinutes = 0;
    let lastDate = null;

    const chart = [];
    const perUserStats = {};

    entries.forEach((entry) => {
      const start =
        entry.start_time instanceof Timestamp
          ? entry.start_time.toDate()
          : new Date(entry.start_time);
      const end =
        entry.end_time instanceof Timestamp ? entry.end_time.toDate() : new Date(entry.end_time);
      const duration = (end - start) / 1000 / 60;
      totalMinutes += duration;
      if (!lastDate || end > lastDate) lastDate = end;

      const dateLabel = start.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
      });

      chart.push({
        date: dateLabel,
        duration: Math.round(duration),
        user: entry.userEmail || entry.userId || '—',
      });

      if (role === 'admin') {
        const key = entry.userEmail || entry.userId || 'Невідомий';
        if (!perUserStats[key]) {
          perUserStats[key] = { count: 0, total: 0 };
        }
        perUserStats[key].count += 1;
        perUserStats[key].total += duration;
      }
    });

    const count = entries.length;
    const usersArray = Object.entries(perUserStats).map(([user, data]) => ({
      user,
      count: data.count,
      totalMinutes: Math.round(data.total),
    }));

    setStats({
      count,
      totalMinutes: Math.round(totalMinutes),
      lastEntryDate: lastDate ? lastDate.toLocaleString('uk-UA') : '—',
    });
    setChartData(chart);
    setUserStats(usersArray);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="container" style={{ padding: '20px' }}>
        <h1>👋 Вітаємо у Dashboard</h1>

        {loading ? (
          <p>Завантаження статистики...</p>
        ) : (
          <>
            <h2>📊 Статистика</h2>
            <ul>
              <li>
                📌 Записів часу: <strong>{stats.count}</strong>
              </li>
              <li>
                ⏳ Загальна тривалість: <strong>{stats.totalMinutes}</strong> хв
              </li>
              <li>
                🗓 Останній запис: <strong>{stats.lastEntryDate}</strong>
              </li>
              {userRole === 'admin' && (
                <li style={{ color: '#2e7d32', marginTop: '10px' }}>
                  👑 Ви адміністратор і переглядаєте всі записи
                </li>
              )}
            </ul>

            {userRole === 'admin' && userStats.length > 0 && (
              <>
                <h3 style={{ marginTop: '30px' }}>👥 Статистика по користувачах</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                  <thead>
                    <tr>
                      <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>
                        Користувач
                      </th>
                      <th style={{ borderBottom: '1px solid #ccc' }}>Кількість записів</th>
                      <th style={{ borderBottom: '1px solid #ccc' }}>Сума часу (хв)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStats.map((u) => (
                      <tr key={u.user}>
                        <td>{u.user}</td>
                        <td style={{ textAlign: 'center' }}>{u.count}</td>
                        <td style={{ textAlign: 'center' }}>{u.totalMinutes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

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
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
