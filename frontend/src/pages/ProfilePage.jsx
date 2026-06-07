import React, { useState, useEffect } from 'react';
import { api } from '../api';
import AlertBanner from '../components/AlertBanner';
import { haptic } from '../telegram';
import Loading from '../components/Loading';

export default function ProfilePage() {
  const [profile, setProfile] = useState({});
  const [user, setUser] = useState({});
  const [bmi, setBmi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getProfile().then(res => {
      if (res.medical_profile) {
        const p = res.medical_profile;
        if (Array.isArray(p.medications)) {
          p.medications = p.medications.join(', ');
        }
        setProfile(p);
      }
      if (res.user) setUser(res.user);
      if (res.bmi) setBmi(res.bmi);
      setInitialLoad(false);
    }).catch(() => setInitialLoad(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    haptic('light');
    setLoading(true);
    try {
      const payload = { ...profile };
      if (typeof payload.medications === 'string') {
        payload.medications = payload.medications.split(',').map(s => s.trim()).filter(Boolean);
      }
      
      await api.updateProfile(payload);
      haptic('success');
      setMessage("Profil muvaffaqiyatli saqlandi!");
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      haptic('error');
      setMessage("Xato: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  if (initialLoad) return <Loading type="skeleton" />;

  return (
    <div className="page-container">
      <h2 className="page-title">👤 Shaxsiy profil</h2>
      <p className="page-subtitle">Tibbiy ma'lumotlaringiz — AI tavsiyalarini shaxsiylashtirish uchun</p>
      
      {message && <AlertBanner type={message.includes('Xato') ? 'danger' : 'success'} message={message} />}
      
      {user && user.full_name && (
        <div className="glass-card" style={{ marginBottom: '16px', background: 'var(--app-primary-gradient)', color: '#fff', border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
              {user.full_name.charAt(0)}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{user.full_name}</h3>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Yoshi: {user.age || 'Kiritilmagan'}</p>
              <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                Diabet turi: {profile.diabetes_type === 'type1' ? '1-tip' : profile.diabetes_type === 'type2' ? '2-tip' : profile.diabetes_type === 'gestational' ? 'Gestatsion' : profile.diabetes_type || 'Kiritilmagan'}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card">
        <label className="form-label">Diabet turi</label>
        <select 
          name="diabetes_type" 
          className="input-field" 
          value={profile.diabetes_type || ''} 
          onChange={handleChange}
        >
          <option value="">Tanlang</option>
          <option value="type1">1-tip qandli diabet</option>
          <option value="type2">2-tip qandli diabet</option>
          <option value="gestational">Gestatsion (homiladorlik) diabeti</option>
          <option value="other">Boshqa</option>
        </select>

        <label className="form-label">Dorilar (vergul bilan ajrating)</label>
        <input
          type="text"
          name="medications"
          className="input-field"
          value={profile.medications || ''}
          onChange={handleChange}
          placeholder="Masalan: Metformin, Insulin glargin"
        />

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label">Bo'y (sm)</label>
            <input
              type="number"
              name="height"
              className="input-field"
              value={profile.height || ''}
              onChange={handleChange}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label">Vazn (kg)</label>
            <input
              type="number"
              name="weight"
              className="input-field"
              value={profile.weight || ''}
              onChange={handleChange}
            />
          </div>
        </div>

        <label className="form-label">Oxirgi HbA1c (%)</label>
        <input
          type="number"
          step="0.1"
          name="hba1c_latest"
          className="input-field"
          value={profile.hba1c_latest || ''}
          onChange={handleChange}
        />
        
        {bmi && (
          <div style={{ padding: '16px', background: 'var(--tg-bg-color)', borderRadius: '14px', marginBottom: '20px', fontSize: '14px', border: '1px solid var(--tg-secondary-bg-color)' }}>
            <strong>Tana vazni indeksi (BMI):</strong> <span style={{ color: 'var(--app-primary)', fontWeight: 'bold' }}>{bmi.bmi}</span> ({bmi.category})
          </div>
        )}

        <button type="submit" className="btn" disabled={loading} style={{ marginTop: '8px' }}>
          {loading ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </form>
    </div>
  );
}
