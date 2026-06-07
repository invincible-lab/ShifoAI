import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { haptic } from '../telegram';

export default function FoodPage() {
  React.useEffect(() => {
    // Small haptic feedback when entering the page to feel more native
    haptic('light');
  }, []);

  return (
    <div className="page-container">
      <h2 style={{ marginBottom: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>🍎 Ovqatlanish</h2>
      
      <div className="glass-card" style={{ borderLeft: '4px solid var(--success-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--success-color)' }}>
          <CheckCircle size={22} />
          <h3 style={{ fontSize: '18px', margin: 0, fontWeight: '600' }}>Ruxsat etilgan mahsulotlar</h3>
        </div>
        <ul style={{ paddingLeft: '24px', lineHeight: '1.7', color: 'var(--tg-text-color)', fontSize: '15px' }}>
          <li style={{ marginBottom: '8px' }}>Barra sabzavotlar (karam, bodring, pomidor, ko'katlar)</li>
          <li style={{ marginBottom: '8px' }}>Yog'siz go'sht va baliq (qaynatilgan yoki pishirilgan)</li>
          <li style={{ marginBottom: '8px' }}>Tuxum (kuniga 1-2 dona)</li>
          <li style={{ marginBottom: '8px' }}>Yog'siz sut mahsulotlari (kefir, tvorog)</li>
          <li style={{ marginBottom: '8px' }}>Suli, grechka va perlovka yormalari</li>
          <li>Shakarsiz mevalar (olma, nok, greyfurt)</li>
        </ul>
      </div>

      <div className="glass-card" style={{ borderLeft: '4px solid var(--danger-color)', marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--danger-color)' }}>
          <XCircle size={22} />
          <h3 style={{ fontSize: '18px', margin: 0, fontWeight: '600' }}>Cheklanishi kerak</h3>
        </div>
        <ul style={{ paddingLeft: '24px', lineHeight: '1.7', color: 'var(--tg-text-color)', fontSize: '15px' }}>
          <li style={{ marginBottom: '8px' }}>Shirinliklar (shakar, asal, murabbo, tortlar)</li>
          <li style={{ marginBottom: '8px' }}>Oq non va pishiriqlar</li>
          <li style={{ marginBottom: '8px' }}>Shirin mevalar (uzum, anjir, banan, xurmo)</li>
          <li style={{ marginBottom: '8px' }}>Gazlangan shirin ichimliklar va qadoqlangan sharbatlar</li>
          <li style={{ marginBottom: '8px' }}>Yog'li go'sht va qovurilgan taomlar</li>
          <li>Kartoshka va oq guruchni me'yorida yeyish</li>
        </ul>
      </div>
      
      <div style={{ padding: '20px', background: 'var(--app-glass-bg)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: '16px', textAlign: 'center', marginTop: '24px', border: '1px solid var(--app-glass-border)' }}>
        <p style={{ fontSize: '15px', color: 'var(--tg-hint-color)' }}>
          Yana biror mahsulot haqida bilmoqchimisiz? <br/>
          <strong style={{ color: 'var(--app-primary)' }}>Chat bo'limiga o'tib ShifoAI dan so'rang!</strong>
        </p>
      </div>
    </div>
  );
}
