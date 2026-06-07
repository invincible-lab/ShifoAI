import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export default function FoodPage() {
  return (
    <div className="page-container">
      <h2 style={{ marginBottom: '20px' }}>🍎 Ovqatlanish bo'yicha tavsiyalar</h2>
      
      <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--success-color)' }}>
          <CheckCircle size={20} />
          <h3 style={{ fontSize: '16px', margin: 0 }}>Ruxsat etilgan mahsulotlar</h3>
        </div>
        <ul style={{ paddingLeft: '24px', lineHeight: '1.6', color: 'var(--text-color)' }}>
          <li>Barra sabzavotlar (karam, bodring, pomidor, ko'katlar)</li>
          <li>Yog'siz go'sht va baliq (qaynatilgan yoki pishirilgan)</li>
          <li>Tuxum (kuniga 1-2 dona)</li>
          <li>Yog'siz sut mahsulotlari (kefir, tvorog)</li>
          <li>Suli, grechka va perlovka yormalari</li>
          <li>Shakarsiz mevalar (olma, nok, greyfurt)</li>
        </ul>
      </div>

      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--danger-color)' }}>
          <XCircle size={20} />
          <h3 style={{ fontSize: '16px', margin: 0 }}>Cheklanishi kerak</h3>
        </div>
        <ul style={{ paddingLeft: '24px', lineHeight: '1.6', color: 'var(--text-color)' }}>
          <li>Shirinliklar (shakar, asal, murabbo, tortlar)</li>
          <li>Oq non va pishiriqlar</li>
          <li>Shirin mevalar (uzum, anjir, banan, xurmo)</li>
          <li>Gazlangan shirin ichimliklar va qadoqlangan sharbatlar</li>
          <li>Yog'li go'sht va qovurilgan taomlar</li>
          <li>Kartoshka va oq guruchni me'yorida yeyish</li>
        </ul>
      </div>
      
      <div style={{ padding: '16px', backgroundColor: 'var(--secondary-bg-color)', borderRadius: '12px', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', marginBottom: '12px' }}>
          Yana biror mahsulot haqida bilmoqchimisiz? Chat bo'limiga o'tib ShifoAI dan so'rang!
        </p>
      </div>
    </div>
  );
}
