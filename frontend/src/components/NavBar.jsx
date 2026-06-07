import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Activity, Bell, User } from 'lucide-react';
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
    boxShadow: '0 -4px 20px rgba(79, 70, 229, 0.06)',
    zIndex: 1000
  };

  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: isActive ? 'var(--app-primary)' : 'var(--tg-hint-color)',
    fontSize: '11px',
    fontWeight: isActive ? '700' : '500',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    transform: isActive ? 'translateY(-2px)' : 'none',
    opacity: isActive ? 1 : 0.7,
    flex: 1
  });

  const handleNavClick = () => {
    haptic('light');
  };

  const items = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Bosh sahifa' },
    { to: '/chat', icon: MessageSquare, label: 'Chat' },
    { to: '/glucose', icon: Activity, label: 'Glyukoza' },
    { to: '/reminders', icon: Bell, label: 'Eslatmalar' },
    { to: '/profile', icon: User, label: 'Profil' },
  ];

  return (
    <nav style={navStyle}>
      {items.map(item => (
        <NavLink key={item.to} to={item.to} style={linkStyle} onClick={handleNavClick}>
          <item.icon size={22} style={{ marginBottom: '4px' }} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
