import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, User, Search, Menu, LogOut, Settings as SettingsIcon, 
  UserCheck, ChevronDown, CheckCheck, Trash2, AlertCircle, 
  TrendingUp, Wallet, ArrowRight, ShieldCheck, Sparkles 
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, getActiveCurrencySymbol } from '../../utils/formatters';
import api from '../../services/api';

export default function Navbar({ toggleSidebar }) {
  const { user, logout, currency } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications on mount and when notif menu opens
  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await api.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.patch(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  };

  const currencySymbol = getActiveCurrencySymbol(currency);

  const getNotifIcon = (type) => {
    switch (type) {
      case 'budget':
        return <Wallet size={16} color="#F59E0B" />;
      case 'expense':
        return <AlertCircle size={16} color="#EF4444" />;
      case 'income':
        return <TrendingUp size={16} color="#10B981" />;
      default:
        return <Sparkles size={16} color="#6366F1" />;
    }
  };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 28px',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 30
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          onClick={toggleSidebar}
          style={{ background: 'transparent', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', cursor: 'pointer', border: 'none' }}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <div style={{ position: 'relative', display: 'none' }} className="desktop-search">
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-color)',
              padding: '7px 12px 7px 34px',
              borderRadius: '20px',
              color: 'var(--text-primary)',
              fontSize: '13px',
              width: '240px'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Currency Tag Badge */}
        <Link
          to="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '16px',
            color: 'var(--accent-indigo)',
            fontSize: '12px',
            fontWeight: '700',
            textDecoration: 'none'
          }}
          title="Active Currency. Click to change in Settings"
        >
          <span>{currencySymbol}</span>
          <span>{currency}</span>
        </Link>

        {/* Notifications Bell Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button 
            onClick={() => {
              setNotifOpen(!notifOpen);
              if (!notifOpen) fetchNotifications();
            }}
            style={{
              background: notifOpen ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              color: 'var(--text-secondary)',
              position: 'relative',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                minWidth: '16px',
                height: '16px',
                backgroundColor: '#EF4444',
                color: 'white',
                borderRadius: '8px',
                fontSize: '10px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {notifOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 10px)',
              width: '340px',
              maxWidth: '90vw',
              backgroundColor: '#1E293B',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
              overflow: 'hidden',
              zIndex: 60,
              animation: 'fadeIn 0.15s ease-out'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: 'rgba(15, 23, 42, 0.5)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>Notifications</h4>
                  {unreadCount > 0 && (
                    <span style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#F87171',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '2px 6px',
                      borderRadius: '10px'
                    }}>
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-indigo)',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCheck size={14} /> Mark read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Bell size={28} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <p style={{ fontSize: '13px', margin: 0 }}>No new notifications</p>
                    <span style={{ fontSize: '11px' }}>Activity and budget alerts will appear here</span>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n._id}
                      onClick={() => handleNotificationClick(n)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        backgroundColor: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.06)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                        transition: 'background-color 0.15s'
                      }}
                      className="notif-item"
                    >
                      <div style={{
                        marginTop: '2px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {getNotifIcon(n.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <h5 style={{
                            margin: '0 0 2px',
                            fontSize: '13px',
                            fontWeight: n.isRead ? '500' : '700',
                            color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)'
                          }}>
                            {n.title}
                          </h5>
                          {!n.isRead && (
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-indigo)', flexShrink: 0 }} />
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {n.message}
                        </p>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  borderTop: '1px solid var(--border-color)',
                  textAlign: 'center'
                }}>
                  <button
                    onClick={handleClearAll}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Trash2 size={12} /> Clear all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: 'background-color 0.2s',
              backgroundColor: dropdownOpen ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
            }}
          >
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user?.name || 'User'}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  border: '2px solid var(--accent-indigo)'
                }}
              />
            ) : (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '13px'
              }}>
                {getUserInitials()}
              </div>
            )}
            <span style={{ fontSize: '14px', fontWeight: '500' }} className="user-name">
              {user?.name || 'User'}
            </span>
            <ChevronDown size={15} color="var(--text-muted)" style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '230px',
              backgroundColor: '#1E293B',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
              padding: '8px 0',
              zIndex: 60,
              animation: 'fadeIn 0.15s ease-out'
            }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.name}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '700'
                  }}>
                    {getUserInitials()}
                  </div>
                )}
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || 'User'}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email || ''}
                  </p>
                </div>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
                className="dropdown-item"
              >
                <UserCheck size={16} color="var(--accent-indigo)" />
                My Profile
              </Link>

              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
                className="dropdown-item"
              >
                <SettingsIcon size={16} color="var(--accent-indigo)" />
                Settings
              </Link>

              <div style={{
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'var(--text-muted)',
                borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                margin: '4px 0'
              }}>
                <span>Active Currency:</span>
                <strong style={{ color: 'var(--accent-indigo)' }}>{currencySymbol} {currency}</strong>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  color: '#EF4444',
                  fontSize: '14px',
                  background: 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                className="dropdown-item"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (min-width: 768px) {
          .desktop-search { display: block !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 768px) {
          .user-name { display: none !important; }
        }
        .dropdown-item:hover, .notif-item:hover {
          background-color: rgba(255, 255, 255, 0.08) !important;
        }
      `}</style>
    </nav>
  );
}
