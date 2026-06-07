import React, { useState } from 'react';
import { api } from '../api';

export default function RegisterPage({ onComplete }) {
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
    setLoading(true);
    try {
      await api.register({ full_name: formData.full_name, age: parseInt(formData.age) });
      await api.updateProfile({ diabetes_type: formData.diabetes_type });
      onComplete();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', color: 'var(--button-color)', marginBottom: '8px' }}>ShifoAI</h1>
        <p style={{ color: 'var(--hint-color)' }}>Xush kelibsiz! Iltimos, o'zingiz haqingizda ma'lumot kiriting.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--secondary-bg-color)', padding: '20px', borderRadius: '16px' }}>
        <label className="form-label">To'liq ismingiz</label>
        <input
          type="text"
          name="full_name"
          className="input-field"
          value={formData.full_name}
          onChange={handleChange}
          required
        />

        <label className="form-label">Yoshingiz</label>
        <input
          type="number"
          name="age"
          className="input-field"
          value={formData.age}
          onChange={handleChange}
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

        <button type="submit" className="btn" style={{ marginTop: '8px' }} disabled={loading}>
          {loading ? 'Saqlanmoqda...' : 'Boshlash'}
        </button>
      </form>
    </div>
  );
}
