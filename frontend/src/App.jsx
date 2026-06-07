import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { initTelegram, getUser } from './telegram.js';
import { api } from './api.js';
import NavBar from './components/NavBar.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import GlucosePage from './pages/GlucosePage.jsx';
import RemindersPage from './pages/RemindersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import FoodPage from './pages/FoodPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import Loading from './components/Loading.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      initTelegram();
      const tgUser = getUser();
      if (tgUser) {
        setUser(tgUser);
      }
    } catch (e) {
      console.error('Telegram init xatolik:', e);
    }

    api.login()
      .then(res => {
        if (res.user?.age && res.user?.full_name) {
          setRegistered(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Login xatolik:', err);
        setLoading(false);
      });

    // Agar 5 sekundda javob kelmasa, loading ni o'chirish
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  if (loading) return <Loading />;

  return (
    <HashRouter>
      <div className="app">
        <Routes>
          <Route path="/" element={<Navigate to={registered ? "/dashboard" : "/register"} replace />} />
          <Route path="/register" element={<RegisterPage onComplete={() => setRegistered(true)} />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={registered ? <DashboardPage user={user} /> : <Navigate to="/register" replace />} />
          <Route path="/chat" element={registered ? <ChatPage user={user} /> : <Navigate to="/register" replace />} />
          <Route path="/glucose" element={registered ? <GlucosePage /> : <Navigate to="/register" replace />} />
          <Route path="/reminders" element={registered ? <RemindersPage /> : <Navigate to="/register" replace />} />
          <Route path="/food" element={registered ? <FoodPage user={user} /> : <Navigate to="/register" replace />} />
          <Route path="/profile" element={registered ? <ProfilePage user={user} /> : <Navigate to="/register" replace />} />
        </Routes>
        {registered && <NavBar />}
      </div>
    </HashRouter>
  );
}