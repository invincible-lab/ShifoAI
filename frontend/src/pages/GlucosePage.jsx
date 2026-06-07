import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus, Plus } from 'lucide-react';
import { api } from '../api';
import GlucoseChart from '../components/GlucoseChart';
import AlertBanner from '../components/AlertBanner';
import { haptic } from '../telegram';
import Loading from '../components/Loading';

const PERIODS = [
  { key: 7, label: '7 kun' },
  { key: 14, label: '14 kun' },
  { key: 30, label: '30 kun' },
];

const CONTEXT_LABELS = {
  fasting: 'Och qoringa',
  before_meal: 'Ovqatdan oldin',
  after_meal: 'Ovqatdan keyin',
  bedtime: 'Uxlashdan oldin',
};

function buildAnalysis(stats, readings) {
  if (!stats || !stats.count) {
    return "Tanlangan davr uchun ko'rsatkichlar topilmadi. Birinchi natijangizni kiriting va men sizga shaxsiy tahlil tayyorlayman.";
  }
  const lines = [];
  if (stats.in_range_percent >= 70) {
    lines.push(`Ajoyib natija — o'lchovlaringizning ${stats.in_range_percent}% i me'yor doirasida (4.0–10.0 mmol/L). Joriy rejimni davom ettiring.`);
  } else if (stats.in_range_percent >= 40) {
    lines.push(`O'lchovlaringizning ${stats.in_range_percent}% i me'yorda. Ovqatlanish vaqti va miqdoriga ko'proq e'tibor qaratish tavsiya etiladi.`);
  } else {
    lines.push(`O'lchovlaringizning atigi ${stats.in_range_percent}% i me'yor doirasida. Iltimos, shifokoringiz bilan terapiya rejasini ko'rib chiqing.`);
  }
  if (stats.max > 13.9) {
    lines.push(`Eng yuqori ko'rsatkichingiz ${stats.max} mmol/L — bu giperglikemiya darajasi, alomatlarga e'tibor bering.`);
  }
  if (stats.min < 3.9) {
    lines.push(`Eng past ko'rsatkichingiz ${stats.min} mmol/L — bu gipoglikemiya, doim o'zingiz bilan shirinlik olib yuring.`);
  }
  // Per meal-context breakdown
  const byCtx = {};
  readings.forEach(r => {
    if (!r.meal_context) return;
    byCtx[r.meal_context] = byCtx[r.meal_context] || [];
    byCtx[r.meal_context].push(r.value);
  });
  const ctxAverages = Object.entries(byCtx).map(([ctx, vals]) => ({
    ctx, avg: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
  }));
  if (ctxAverages.length) {
    const worst = ctxAverages.reduce((a, b) => (b.avg > a.avg ? b : a));
    if (worst.avg > 10.0) {
      lines.push(`"${CONTEXT_LABELS[worst.ctx] || worst.ctx}" holatida o'rtacha ko'rsatkichingiz (${worst.avg} mmol/L) eng yuqori — shu vaqtga alohida e'tibor bering.`);
    }
  }
  return lines.join(' ');
}

function trendInfo(readings) {
  if (!readings || readings.length < 4) return null;
  const half = Math.floor(readings.length / 2);
  const firstHalf = readings.slice(0, half);
  const secondHalf = readings.slice(half);
  const avg = arr => arr.reduce((a, b) => a + b.value, 0) / arr.length;
  const diff = +(avg(secondHalf) - avg(firstHalf)).toFixed(1);
  if (Math.abs(diff) < 0.3) return { icon: Minus, label: 'Barqaror dinamika', color: 'var(--tg-hint-color)' };
  if (diff > 0) return { icon: TrendingUp, label: `O'sish tendensiyasi (+${diff})`, color: 'var(--warning-color)' };
  return { icon: TrendingDown, label: `Yaxshilanish tendensiyasi (${diff})`, color: 'var(--success-color)' };
}

export default function GlucosePage() {
  const [value, setValue] = useState('');
  const [context, setContext] = useState('fasting');
  const [readings, setReadings] = useState([]);
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState(14);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [warning, setWarning] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = (days = period) => {
    api.getGlucose(days).then(res => {
      if (res.readings) setReadings(res.readings);
      if (res.stats) setStats(res.stats);
      setInitialLoad(false);
    }).catch(() => setInitialLoad(false));
  };

  useEffect(() => {
    loadData(period);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const analysis = useMemo(() => buildAnalysis(stats, readings), [stats, readings]);
  const trend = useMemo(() => trendInfo(readings), [readings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value || isNaN(value)) {
      haptic('warning');
      return;
    }

    haptic('light');
    setLoading(true);
    try {
      const res = await api.addGlucose(parseFloat(value), context);
      haptic('success');
      setWarning(res.warning);
      setValue('');
      setShowForm(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      loadData(period);
    } catch (error) {
      haptic('error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) return <Loading type="skeleton" />;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">📊 Glyukoza monitoringi</h2>
          <p className="page-subtitle" style={{ marginBottom: '12px' }}>Ko'rsatkichlaringiz va sun'iy intellekt tahlili</p>
        </div>
        <button
          className="btn btn-icon"
          style={{ boxShadow: '0 8px 20px rgba(79,70,229,0.28)' }}
          onClick={() => { haptic('light'); setShowForm(s => !s); }}
        >
          <Plus size={22} />
        </button>
      </div>

      <AlertBanner type={warning && (warning.includes('GIPO') || warning.includes('GIPER')) ? 'danger' : 'warning'} message={warning} />

      {showForm && (
        <div className="glass-card" style={{ animation: 'fadeIn 0.3s ease' }}>
          <h3 className="section-title">Yangi ko'rsatkich qo'shish</h3>
          <form onSubmit={handleSubmit}>
            <label className="form-label">Miqdor (mmol/L)</label>
            <input
              type="number"
              step="0.1"
              className="input-field"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Masalan: 5.5"
              required
            />

            <label className="form-label">Vaqt konteksti</label>
            <select
              className="input-field"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            >
              <option value="fasting">Och qoringa (Nahorga)</option>
              <option value="before_meal">Ovqatdan oldin</option>
              <option value="after_meal">Ovqatdan 2 soat o'tib</option>
              <option value="bedtime">Uxlashdan oldin</option>
            </select>

            <button type="submit" className="btn" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </form>
        </div>
      )}

      {/* Period selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {PERIODS.map(p => (
          <button
            key={p.key}
            className="chip"
            style={{
              background: period === p.key ? 'var(--app-primary-gradient)' : 'var(--app-glass-bg)',
              color: period === p.key ? '#fff' : 'var(--app-primary)',
              border: period === p.key ? 'none' : '1px solid var(--app-glass-border)'
            }}
            onClick={() => { haptic('light'); setPeriod(p.key); }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Stats summary */}
      {stats && stats.count > 0 && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span className="section-title" style={{ marginBottom: 0 }}>Statistik ko'rsatkichlar</span>
            {trend && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: trend.color }}>
                <trend.icon size={14} /> {trend.label}
              </span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: '20px', fontWeight: '800' }}>{stats.average}</p>
              <p style={{ fontSize: '11px', color: 'var(--tg-hint-color)' }}>O'rtacha</p>
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--danger-color)' }}>{stats.min}</p>
              <p style={{ fontSize: '11px', color: 'var(--tg-hint-color)' }}>Minimum</p>
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--warning-color)' }}>{stats.max}</p>
              <p style={{ fontSize: '11px', color: 'var(--tg-hint-color)' }}>Maksimum</p>
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: '800', color: 'var(--success-color)' }}>{stats.in_range_percent}%</p>
              <p style={{ fontSize: '11px', color: 'var(--tg-hint-color)' }}>Me'yorda</p>
            </div>
          </div>
          <div style={{ marginTop: '14px', height: '8px', borderRadius: '999px', background: 'var(--tg-secondary-bg-color)', overflow: 'hidden' }}>
            <div style={{ width: `${stats.in_range_percent}%`, height: '100%', background: 'var(--app-primary-gradient)', borderRadius: '999px', transition: 'width 0.6s ease' }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--tg-hint-color)', marginTop: '6px' }}>{stats.count} ta o'lchov • me'yor: 4.0–10.0 mmol/L</p>
        </div>
      )}

      {/* AI analysis */}
      <div className="glass-card" style={{ borderLeft: '4px solid var(--app-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '14px', background: 'var(--app-primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 16px rgba(79,70,229,0.3)' }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>Sun'iy intellekt tahlili</p>
            <p style={{ fontSize: '14px', color: 'var(--tg-hint-color)', lineHeight: '1.6' }}>{analysis}</p>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3 className="section-title">Ko'rsatkichlar dinamikasi</h3>
        <GlucoseChart data={readings} />
      </div>
    </div>
  );
}
