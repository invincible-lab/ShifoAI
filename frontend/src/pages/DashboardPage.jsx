import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Activity, MessageSquare, Apple, Bell, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '../api';
import { haptic } from '../telegram';
import Loading from '../components/Loading';

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Xayrli tun';
  if (h < 12) return 'Xayrli tong';
  if (h < 18) return 'Xayrli kun';
  return 'Xayrli kech';
}

function buildInsight(stats, profile) {
  if (!stats || !stats.count) {
    return "Hali glyukoza ko'rsatkichlaringiz yo'q. Birinchi natijangizni kiriting — men sizga shaxsiy tahlil va tavsiyalar tayyorlab beraman.";
  }
  const parts = [];
  if (stats.average != null) {
    if (stats.average >= 4.0 && stats.average <= 10.0) {
      parts.push(`So'nggi 7 kunlik o'rtacha ko'rsatkichingiz ${stats.average} mmol/L — bu me'yor doirasida. Davom eting!`);
    } else if (stats.average > 10.0) {
      parts.push(`So'nggi 7 kunlik o'rtacha ko'rsatkichingiz ${stats.average} mmol/L — bu me'yordan yuqori. Ovqatlanish tartibingizni qayta ko'rib chiqish va shifokor bilan maslahatlashish tavsiya etiladi.`);
    } else {
      parts.push(`So'nggi 7 kunlik o'rtacha ko'rsatkichingiz ${stats.average} mmol/L — bu past ko'rsatkich. Gipoglikemiya alomatlariga e'tibor bering.`);
    }
  }
  if (stats.in_range_percent != null) {
    parts.push(`O'lchovlaringizning ${stats.in_range_percent}% i me'yor doirasida (4.0–10.0 mmol/L) qayd etilgan.`);
  }
  if (profile?.diabetes_type) {
    const types = { type1: '1-tip', type2: '2-tip', gestational: 'gestatsion', other: 'boshqa turdagi' };
    parts.push(`${types[profile.diabetes_type] || ''} qandli diabet profilingiz asosida tavsiyalar shaxsiylashtirilgan.`);
  }
  return parts.join(' ');
}

function trendInfo(readings) {
  if (!readings || readings.length < 2) return null;
  const last = readings[readings.length - 1].value;
  const prev = readings[readings.length - 2].value;
  const diff = +(last - prev).toFixed(1);
  if (Math.abs(diff) < 0.2) return { icon: Minus, label: "Barqaror", color: 'var(--tg-hint-color)', diff };
  if (diff > 0) return { icon: TrendingUp, label: `+${diff} mmol/L`, color: 'var(--warning-color)', diff };
  return { icon: TrendingDown, label: `${diff} mmol/L`, color: 'var(--success-color)', diff };
}

function statusOf(value) {
  if (value == null) return { label: 'Ma\'lumot yo\'q', color: 'var(--tg-hint-color)', bg: 'var(--tg-secondary-bg-color)' };
  if (value < 3.9) return { label: 'Past (gipoglikemiya)', color: '#fff', bg: 'var(--danger-color)' };
  if (value > 10.0) return { label: 'Yuqori (giperglikemiya)', color: '#fff', bg: 'var(--warning-color)' };
  return { label: 'Me\'yorda', color: '#fff', bg: 'var(--success-color)' };
}

export default function DashboardPage({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [readings, setReadings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      api.getGlucose(14),
      api.getProfile(),
      api.getReminders(),
    ]).then(([glucoseRes, profileRes, remindersRes]) => {
      if (glucoseRes.status === 'fulfilled') {
        setReadings(glucoseRes.value.readings || []);
        setStats(glucoseRes.value.stats || null);
      }
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.medical_profile || null);
      }
      if (remindersRes.status === 'fulfilled') {
        setReminders((remindersRes.value.reminders || []).filter(r => r.active));
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading type="skeleton" />;

  const latest = readings.length ? readings[readings.length - 1] : null;
  const status = statusOf(latest?.value);
  const trend = trendInfo(readings);
  const insight = buildInsight(stats, profile);
  const name = (user?.first_name || profile?.full_name || '').trim();

  const quickActions = [
    { icon: MessageSquare, label: 'AI Chat', desc: "Savol bering", to: '/chat', gradient: 'var(--app-primary-gradient)' },
    { icon: Activity, label: 'Glyukoza', desc: "Ko'rsatkich kiritish", to: '/glucose', gradient: 'var(--app-accent-gradient)' },
    { icon: Apple, label: 'Ovqatlanish', desc: 'Tavsiyalar', to: '/food', gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' },
    { icon: Bell, label: 'Eslatmalar', desc: `${reminders.length} faol`, to: '/reminders', gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)' },
  ];

  return (
    <div className="page-container">
      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: 'var(--tg-hint-color)', fontSize: '14px', fontWeight: '600' }}>{timeGreeting()}{name ? ',' : ''}</p>
        <h1 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.6px' }}>{name || 'Xush kelibsiz'} 👋</h1>
      </div>

      {/* AI Insight card */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--app-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '14px', background: 'var(--app-primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 16px rgba(79,70,229,0.3)' }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>ShifoAI tahlili</p>
            <p style={{ fontSize: '14px', color: 'var(--tg-hint-color)', lineHeight: '1.6' }}>{insight}</p>
            <button
              className="chip"
              style={{ marginTop: '12px' }}
              onClick={() => { haptic('light'); navigate('/chat'); }}
            >
              Batafsil so'rash <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Latest reading snapshot */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span className="section-title" style={{ marginBottom: 0 }}>So'nggi glyukoza</span>
          <span className="stat-pill" style={{ background: status.bg, color: status.color }}>{status.label}</span>
        </div>
        {latest ? (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', marginTop: '12px' }}>
            <div>
              <span style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1px' }}>{latest.value}</span>
              <span style={{ fontSize: '14px', color: 'var(--tg-hint-color)', marginLeft: '6px' }}>{latest.unit || 'mmol/L'}</span>
            </div>
            {trend && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: trend.color, fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                <trend.icon size={16} /> {trend.label}
              </div>
            )}
          </div>
        ) : (
          <p style={{ color: 'var(--tg-hint-color)', fontSize: '14px', marginTop: '8px' }}>Hali ko'rsatkich kiritilmagan</p>
        )}
        {stats && stats.count > 0 && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
            <span className="stat-pill primary">7 kun o'rtacha: {stats.average ?? '—'}</span>
            <span className="stat-pill info">Me'yorda: {stats.in_range_percent ?? '—'}%</span>
            <span className="stat-pill">{stats.count} o'lchov</span>
          </div>
        )}
      </div>

      {/* Upcoming reminder */}
      {reminders.length > 0 && (
        <div className="glass-card" onClick={() => { haptic('light'); navigate('/reminders'); }} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '14px', background: 'rgba(217, 119, 6, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bell size={18} color="var(--warning-color)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '700', fontSize: '14px' }}>{reminders[0].title}</p>
              <p style={{ fontSize: '13px', color: 'var(--tg-hint-color)' }}>Bugun, soat {reminders[0].time}</p>
            </div>
            <ChevronRight size={18} color="var(--tg-hint-color)" />
          </div>
        </div>
      )}

      {/* Quick actions grid */}
      <p className="section-title" style={{ marginTop: '8px' }}>Tezkor amallar</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {quickActions.map((action) => (
          <div
            key={action.to}
            className="glass-card"
            style={{ margin: 0, cursor: 'pointer', padding: '16px' }}
            onClick={() => { haptic('light'); navigate(action.to); }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: action.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', boxShadow: '0 6px 16px rgba(0,0,0,0.12)' }}>
              <action.icon size={20} color="#fff" />
            </div>
            <p style={{ fontWeight: '700', fontSize: '15px' }}>{action.label}</p>
            <p style={{ fontSize: '12px', color: 'var(--tg-hint-color)', marginTop: '2px' }}>{action.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
