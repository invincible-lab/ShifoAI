import React, { useState, useEffect } from 'react';
import { api } from '../api';
import AlertBanner from '../components/AlertBanner';

export default function ProfilePage() {
  const [profile, setProfile] = useState({});
  const [user, setUser] = useState({});
  const [bmi, setBmi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getProfile().then(res => {
      if (res.medical_profile) setProfile(res.medical_profile);
      if (res.user) setUser(res.user);
      if (res.bmi) setBmi(res.bmi);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile(profile);
      setMessage("Profil muvaffaqiyatli saqlandi!");
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="page-container">
      <h2 style={{ marginBottom: '20px' }}>👤 Shaxsiy Profil</h2>
      
      {message && <AlertBanner type={message.includes('Xato') ? 'danger' : 'success'} message={message} />}
      
      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--secondary-bg-color)', padding: '16px', borderRadius: '12px' }}>
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

        <div style={{ display: 'flex', gap: '12px' }}>
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
          <div style={{ padding: '12px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            <strong>Tana vazni indeksi (BMI):</strong> {bmi.bmi} ({bmi.category})
          </div>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </form>
    </div>
  );
}
