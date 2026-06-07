import React, { useState, useEffect } from 'react';
import { api } from '../api';
import GlucoseChart from '../components/GlucoseChart';
import AlertBanner from '../components/AlertBanner';

export default function GlucosePage() {
  const [value, setValue] = useState('');
  const [context, setContext] = useState('fasting');
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState(null);

  const loadData = () => {
    api.getGlucose().then(res => {
      if (res.readings) {
        setReadings(res.readings);
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value || isNaN(value)) return;
    
    setLoading(true);
    try {
      const res = await api.addGlucose(parseFloat(value), context);
      setWarning(res.warning);
      setValue('');
      loadData();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2 style={{ marginBottom: '20px' }}>📊 Glyukoza monitoringi</h2>
      
      <AlertBanner type={warning && (warning.includes('GIPO') || warning.includes('GIPER')) ? 'danger' : 'warning'} message={warning} />
      
      <div style={{ backgroundColor: 'var(--secondary-bg-color)', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Yangi ko'rsatkich qo'shish</h3>
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
          
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </form>
      </div>

      <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Oxirgi ko'rsatkichlar</h3>
      <GlucoseChart data={readings} />
    </div>
  );
}
