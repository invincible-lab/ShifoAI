import React, { useState, useEffect } from 'react';
import { api } from '../api';
import GlucoseChart from '../components/GlucoseChart';
import AlertBanner from '../components/AlertBanner';
import { haptic } from '../telegram';
import Loading from '../components/Loading';

export default function GlucosePage() {
  const [value, setValue] = useState('');
  const [context, setContext] = useState('fasting');
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [warning, setWarning] = useState(null);

  const loadData = () => {
    api.getGlucose().then(res => {
      if (res.readings) {
        setReadings(res.readings);
      }
      setInitialLoad(false);
    }).catch(() => setInitialLoad(false));
  };

  useEffect(() => {
    loadData();
  }, []);

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
      loadData();
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
      <h2 style={{ marginBottom: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>📊 Glyukoza monitoringi</h2>
      
      <AlertBanner type={warning && (warning.includes('GIPO') || warning.includes('GIPER')) ? 'danger' : 'warning'} message={warning} />
      
      <div className="glass-card">
        <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Yangi ko'rsatkich qo'shish</h3>
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

      <div className="glass-card" style={{ marginTop: '24px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Oxirgi ko'rsatkichlar</h3>
        <GlucoseChart data={readings} />
      </div>
    </div>
  );
}
