import React from 'react';
import { LayoutDashboard, Receipt, PieChart, Settings, Wallet, X, Tag, TrendingUp, Target } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ isOpen, toggleSidebar }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',    path: '/dashboard', color: '#7c7fff' },
    { icon: Receipt,         label: 'Transactions', path: '/transactions', color: '#10dfa4' },
    { icon: PieChart,        label: 'Analytics',    path: '/analytics', color: '#22d3ee' },
    { icon: Tag,             label: 'Categories',   path: '/categories', color: '#a78bfa' },
    { icon: Wallet,          label: 'Budgets',      path: '/budgets', color: '#fbbf24' },
    { icon: Settings,        label: 'Settings',     path: '/settings', color: '#f472b6' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
          className="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`} style={{
        width: '260px',
        background: 'linear-gradient(180deg, #09101f 0%, #0c1428 100%)',
        borderRight: '1px solid rgba(99,102,241,0.15)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0, top: 0,
        zIndex: 50,
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        {/* Logo */}
        <div style={{
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(99,102,241,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: '800', fontSize: '16px',
              boxShadow: '0 0 16px rgba(99,102,241,0.4)',
            }}>₹</div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px', color: '#f0f4ff' }}>SpendWise</span>
              <div style={{ fontSize: '10px', color: '#4e5e8a', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }}>Finance Manager</div>
            </div>
          </div>
          <button onClick={toggleSidebar} className="close-btn" style={{ background: 'transparent', color: '#4e5e8a', padding: '4px', borderRadius: '6px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav Menu */}
        <nav style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{ fontSize: '10px', fontWeight: '700', color: '#4e5e8a', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px', paddingLeft: '12px' }}>
            Navigation
          </p>
          {menuItems.map((item, idx) => (
            <NavLink
              key={idx}
              to={item.path}
              onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '12px',
                color: isActive ? '#fff' : '#8b9cc8',
                background: isActive
                  ? `linear-gradient(90deg, rgba(99,102,241,0.2), rgba(99,102,241,0.08))`
                  : 'transparent',
                borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
                fontWeight: isActive ? '700' : '500',
                fontSize: '14px',
                transition: 'all 0.2s',
                textDecoration: 'none',
              })}
            >
              {({ isActive }) => (
                <>
                  <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '8px',
                    background: isActive ? `${item.color}22` : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}>
                    <item.icon size={17} color={isActive ? item.color : 'currentColor'} />
                  </div>
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Card */}
        <div style={{
          margin: '12px',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
          borderRadius: '14px',
          border: '1px solid rgba(99,102,241,0.2)',
        }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#f0f4ff', marginBottom: '4px' }}>✨ Pro Tip</div>
          <div style={{ fontSize: '11px', color: '#8b9cc8', lineHeight: '1.5' }}>
            Track expenses daily for the most accurate financial insights.
          </div>
        </div>
      </aside>

      <style>{`
        .sidebar-container {
          transform: translateX(-100%);
        }
        .sidebar-container.open {
          transform: translateX(0);
        }
        .close-btn { display: block; }

        @media (min-width: 768px) {
          .sidebar-container {
            transform: translateX(0);
          }
          .sidebar-overlay { display: none !important; }
          .close-btn { display: none !important; }
        }

        .sidebar-container a:hover {
          background: rgba(255,255,255,0.05) !important;
          color: #f0f4ff !important;
        }
      `}</style>
    </>
  );
}
