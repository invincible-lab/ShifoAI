import React from 'react';
import { NavLink } from 'react-router-dom';
import { MessageSquare, Activity, Apple, User } from 'lucide-react';

export default function NavBar() {
  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--secondary-bg-color)',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px 0',
    borderTop: '1px solid var(--hint-color)',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
    zIndex: 1000
  };

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: isActive ? 'var(--button-color)' : 'var(--hint-color)',
    fontSize: '12px',
    fontWeight: isActive ? '600' : '400',
    transition: 'color 0.2s'
  });

  return (
    <nav style={navStyle}>
      <NavLink to="/chat" style={linkStyle}>
        <MessageSquare size={24} style={{ marginBottom: '4px' }} />
        <span>Chat</span>
      </NavLink>
      <NavLink to="/glucose" style={linkStyle}>
        <Activity size={24} style={{ marginBottom: '4px' }} />
        <span>Glyukoza</span>
      </NavLink>
      <NavLink to="/food" style={linkStyle}>
        <Apple size={24} style={{ marginBottom: '4px' }} />
        <span>Ovqat</span>
      </NavLink>
      <NavLink to="/profile" style={linkStyle}>
        <User size={24} style={{ marginBottom: '4px' }} />
        <span>Profil</span>
      </NavLink>
    </nav>
  );
}
