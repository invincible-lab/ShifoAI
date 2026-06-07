import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, Activity, Apple, User } from 'lucide-react';
import { haptic } from '../telegram';

export default function NavBar() {
  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'var(--app-glass-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px 0',
    paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
    borderTop: '1px solid var(--app-glass-border)',
    boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
    zIndex: 1000
  };

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: isActive ? 'var(--app-primary)' : 'var(--tg-hint-color)',
    fontSize: '12px',
    fontWeight: isActive ? '600' : '500',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    transform: isActive ? 'translateY(-2px)' : 'none',
    opacity: isActive ? 1 : 0.7
  });

  const handleNavClick = () => {
    haptic('light');
  };

  return (
    <nav style={navStyle}>
      <NavLink to="/chat" style={linkStyle} onClick={handleNavClick}>
        <MessageSquare size={24} style={{ marginBottom: '4px' }} />
        <span>Chat</span>
      </NavLink>
      <NavLink to="/glucose" style={linkStyle} onClick={handleNavClick}>
        <Activity size={24} style={{ marginBottom: '4px' }} />
        <span>Glyukoza</span>
      </NavLink>
      <NavLink to="/food" style={linkStyle} onClick={handleNavClick}>
        <Apple size={24} style={{ marginBottom: '4px' }} />
        <span>Ovqat</span>
      </NavLink>
      <NavLink to="/profile" style={linkStyle} onClick={handleNavClick}>
        <User size={24} style={{ marginBottom: '4px' }} />
        <span>Profil</span>
      </NavLink>
    </nav>
  );
}
