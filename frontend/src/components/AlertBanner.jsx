import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export default function AlertBanner({ type, message }) {
  if (!message) return null;

  const isDanger = type === 'danger' || message.toLowerCase().includes('gipo') || message.toLowerCase().includes('giper');
  const isSuccess = type === 'success';
  const bgColor = isDanger ? 'var(--danger-color)' : isSuccess ? 'var(--success-color)' : 'var(--warning-color)';
  const textColor = '#fff';

  return (
    <div style={{
      backgroundColor: bgColor,
      color: textColor,
      padding: '12px 16px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {isDanger ? <AlertTriangle size={20} /> : <Info size={20} />}
      <span style={{ fontSize: '14px', fontWeight: '500' }}>{message}</span>
    </div>
  );
}
