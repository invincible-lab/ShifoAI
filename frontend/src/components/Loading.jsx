import React from 'react';

export default function Loading({ type = "full" }) {
  if (type === "skeleton") {
    return (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="skeleton" style={{ height: '120px', width: '100%' }}></div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="skeleton" style={{ height: '80px', flex: 1 }}></div>
          <div className="skeleton" style={{ height: '80px', flex: 1 }}></div>
        </div>
        <div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', color: 'var(--app-primary)' }}>
      <div className="skeleton" style={{ width: '64px', height: '64px', borderRadius: '50%', marginBottom: '24px' }}></div>
      <div className="skeleton" style={{ width: '150px', height: '24px', borderRadius: '12px' }}></div>
      <div className="skeleton" style={{ width: '100px', height: '16px', borderRadius: '8px', marginTop: '12px', opacity: 0.7 }}></div>
    </div>
  );
}
