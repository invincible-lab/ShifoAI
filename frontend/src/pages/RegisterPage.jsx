import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { haptic } from '../telegram';
import { Activity } from 'lucide-react';

export default function RegisterPage({ onComplete }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    diabetes_type: 'type2'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    haptic('light');
    setLoading(true);
    try {
      await api.register({ full_name: formData.full_name, age: parseInt(formData.age) });
      await api.updateProfile({ diabetes_type: formData.diabetes_type });
      haptic('success');
      onComplete();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      haptic('error');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px', animation: 'fadeIn 0.6s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ background: 'var(--app-primary-gradient)', padding: '16px', borderRadius: '24px', color: '#fff', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)' }}>
            <Activity size={40} />
          </div>
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--tg-text-color)', marginBottom: '8px', letterSpacing: '-0.5px' }}>ShifoAI</h1>
        <p style={{ color: 'var(--tg-hint-color)', fontSize: '15px' }}>Xush kelibsiz! Iltimos, o'zingiz haqingizda ma'lumot kiriting.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card">
        <label className="form-label">To'liq ismingiz</label>
        <input
          type="text"
          name="full_name"
          className="input-field"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="Ism va familiya"
          required
        />

        <label className="form-label">Yoshingiz</label>
        <input
          type="number"
          name="age"
          className="input-field"
          value={formData.age}
          onChange={handleChange}
          placeholder="Masalan: 45"
          required
        />

        <label className="form-label">Diabet turi</label>
        <select 
          name="diabetes_type" 
          className="input-field" 
          value={formData.diabetes_type} 
          onChange={handleChange}
        >
          <option value="type1">1-tip qandli diabet</option>
          <option value="type2">2-tip qandli diabet</option>
          <option value="gestational">Gestatsion (homiladorlik) diabeti</option>
          <option value="other">Boshqa / Bilmayman</option>
        </select>

        <button type="submit" className="btn" style={{ marginTop: '16px' }} disabled={loading}>
          {loading ? 'Saqlanmoqda...' : 'Boshlash'}
        </button>
      </form>
    </div>
  );
}
