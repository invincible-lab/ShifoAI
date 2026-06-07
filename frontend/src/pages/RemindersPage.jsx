import React, { useState, useEffect } from 'react';
import { Plus, Pill, Activity, Stethoscope, Trash2, X } from 'lucide-react';
import { api } from '../api';
import { haptic } from '../telegram';
import Loading from '../components/Loading';

const KINDS = [
  { key: 'medication', label: 'Dori qabul qilish', icon: Pill, color: '#4f46e5' },
  { key: 'glucose_check', label: "Glyukoza o'lchash", icon: Activity, color: '#0891b2' },
  { key: 'appointment', label: 'Shifokor qabuli', icon: Stethoscope, color: '#7c3aed' },
];

const DAYS = [
  { key: 'mon', label: 'Du' }, { key: 'tue', label: 'Se' }, { key: 'wed', label: 'Cho' },
  { key: 'thu', label: 'Pa' }, { key: 'fri', label: 'Ju' }, { key: 'sat', label: 'Sha' }, { key: 'sun', label: 'Ya' },
];

function kindMeta(kind) {
  return KINDS.find(k => k.key === kind) || KINDS[0];
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ kind: 'medication', title: '', time: '08:00', days_of_week: [] });

  const load = () => {
    api.getReminders().then(res => {
      setReminders(res.reminders || []);
      setInitialLoad(false);
    }).catch(() => setInitialLoad(false));
  };

  useEffect(() => { load(); }, []);

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { haptic('warning'); return; }
    haptic('light');
    setSaving(true);
    try {
      await api.addReminder({
        kind: form.kind,
        title: form.title.trim(),
        time: form.time,
        days_of_week: form.days_of_week.length ? form.days_of_week : null,
      });
      haptic('success');
      setForm({ kind: 'medication', title: '', time: '08:00', days_of_week: [] });
      setShowForm(false);
      load();
    } catch (err) {
      haptic('error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (r) => {
    haptic('light');
    setReminders(prev => prev.map(x => x.id === r.id ? { ...x, active: !x.active } : x));
    try {
      await api.toggleReminder(r.id, !r.active);
    } catch {
      load();
    }
  };

  const handleDelete = async (r) => {
    haptic('warning');
    setReminders(prev => prev.filter(x => x.id !== r.id));
    try {
      await api.deleteReminder(r.id);
    } catch {
      load();
    }
  };

  if (initialLoad) return <Loading type="skeleton" />;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">🔔 Eslatmalar</h2>
          <p className="page-subtitle" style={{ marginBottom: '12px' }}>Dori, o'lchov va shifokor qabullarini unutmang</p>
        </div>
        <button
          className="btn btn-icon"
          style={{ boxShadow: '0 8px 20px rgba(79,70,229,0.28)' }}
          onClick={() => { haptic('light'); setShowForm(s => !s); }}
        >
          {showForm ? <X size={22} /> : <Plus size={22} />}
        </button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ animation: 'fadeIn 0.3s ease' }}>
          <h3 className="section-title">Yangi eslatma</h3>
          <form onSubmit={handleSubmit}>
            <label className="form-label">Turi</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {KINDS.map(k => (
                <button
                  type="button"
                  key={k.key}
                  className="chip"
                  style={{
                    background: form.kind === k.key ? k.color : 'var(--app-glass-bg)',
                    color: form.kind === k.key ? '#fff' : k.color,
                    border: form.kind === k.key ? 'none' : `1px solid ${k.color}33`
                  }}
                  onClick={() => setForm(prev => ({ ...prev, kind: k.key }))}
                >
                  <k.icon size={14} /> {k.label}
                </button>
              ))}
            </div>

            <label className="form-label">Sarlavha</label>
            <input
              type="text"
              className="input-field"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Masalan: Metformin 500mg"
              required
            />

            <label className="form-label">Vaqt</label>
            <input
              type="time"
              className="input-field"
              value={form.time}
              onChange={(e) => setForm(prev => ({ ...prev, time: e.target.value }))}
              required
            />

            <label className="form-label">Takrorlanish kunlari (ixtiyoriy — bo'sh bo'lsa, har kuni)</label>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {DAYS.map(d => (
                <button
                  type="button"
                  key={d.key}
                  onClick={() => toggleDay(d.key)}
                  style={{
                    width: '40px', height: '40px', borderRadius: '12px', border: 'none',
                    fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                    background: form.days_of_week.includes(d.key) ? 'var(--app-primary-gradient)' : 'var(--tg-secondary-bg-color)',
                    color: form.days_of_week.includes(d.key) ? '#fff' : 'var(--tg-hint-color)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <button type="submit" className="btn" disabled={saving} style={{ marginTop: '4px' }}>
              {saving ? 'Saqlanmoqda...' : 'Eslatma qo\'shish'}
            </button>
          </form>
        </div>
      )}

      {reminders.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</div>
          <p style={{ fontWeight: '700', marginBottom: '4px' }}>Hali eslatmalar yo'q</p>
          <p style={{ fontSize: '13px', color: 'var(--tg-hint-color)' }}>Dori qabul qilish yoki glyukoza o'lchash uchun eslatma qo'shing</p>
        </div>
      ) : (
        reminders.map(r => {
          const meta = kindMeta(r.kind);
          return (
            <div key={r.id} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '14px', opacity: r.active ? 1 : 0.55 }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: `${meta.color}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <meta.icon size={20} color={meta.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: '700', fontSize: '15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                <p style={{ fontSize: '12px', color: 'var(--tg-hint-color)' }}>
                  {meta.label} • {r.time}
                  {Array.isArray(r.days_of_week) && r.days_of_week.length > 0 && (
                    <> • {r.days_of_week.map(d => DAYS.find(x => x.key === d)?.label || d).join(', ')}</>
                  )}
                  {(!r.days_of_week || (Array.isArray(r.days_of_week) && r.days_of_week.length === 0)) && <> • Har kuni</>}
                </p>
              </div>
              <label className="switch">
                <input type="checkbox" checked={r.active} onChange={() => handleToggle(r)} />
                <span className="switch-track"></span>
              </label>
              <button
                onClick={() => handleDelete(r)}
                style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '6px', display: 'flex' }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
