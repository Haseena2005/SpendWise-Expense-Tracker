import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Mail, Calendar, ShieldCheck, ArrowRight, 
  Settings as SettingsIcon, LogOut, Wallet, Receipt 
} from 'lucide-react';
import api from '../services/api';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalTransactions: 0, totalCategories: 0 });

  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const [txRes, catRes] = await Promise.all([
          api.get('/transactions?limit=1'),
          api.get('/categories')
        ]);
        setStats({
          totalTransactions: txRes.data?.pagination?.total || 0,
          totalCategories: catRes.data?.data?.length || 0
        });
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      }
    };
    fetchQuickStats();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const parts = user.name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'October 2026';

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Page Header */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            User Profile
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            View your account details and financial workspace summary
          </p>
        </div>

        {/* Profile Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap'
        }}>
          {user?.profilePhoto ? (
            <img 
              src={user.profilePhoto} 
              alt={user.name} 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--accent-indigo)',
                boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
              }}
            />
          ) : (
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '800',
              fontSize: '28px',
              boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
            }}>
              {getUserInitials()}
            </div>
          )}

          <div style={{ flex: 1, minWidth: '220px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {user?.name || 'SpendWise User'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '4px 0 12px' }}>
              {user?.email || 'user@spendwise.com'}
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '20px',
              color: '#34D399',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              <ShieldCheck size={14} />
              Active Account
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-indigo)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Calendar size={22} />
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Member Since</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{memberSince}</span>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Receipt size={22} />
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Total Transactions</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{stats.totalTransactions} recorded</span>
            </div>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Wallet size={22} />
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Active Categories</span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{stats.totalCategories} configured</span>
            </div>
          </div>
        </div>

        {/* Quick Navigation Actions */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px' }}>
            Quick Actions
          </h3>

          <Link
            to="/settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <SettingsIcon size={18} color="var(--accent-indigo)" />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Manage App Settings & Preferences</span>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </Link>

          <Link
            to="/categories"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              transition: 'all 0.15s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Wallet size={18} color="#10B981" />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Customize Income & Expense Categories</span>
            </div>
            <ArrowRight size={16} color="var(--text-muted)" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
