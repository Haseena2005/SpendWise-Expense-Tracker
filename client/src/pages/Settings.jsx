import React, { useState, useRef } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, User, Shield, Globe, 
  LogOut, Check, Bell, Moon, Lock, Info, Upload, Trash2, Download 
} from 'lucide-react';
import api from '../services/api';

export default function Settings() {
  const { user, logout, updateCurrency, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [currency, setCurrency] = useState(() => user?.currency || 'INR');
  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('spendwise_date_format') || 'DD/MM/YYYY');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [photoError, setPhotoError] = useState('');
  
  const fileInputRef = useRef(null);

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      if (currency !== user?.currency) {
        await updateCurrency(currency);
      }
      localStorage.setItem('spendwise_date_format', dateFormat);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Maximum size: 5 MB');
      return;
    }
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Please upload JPG, PNG or WEBP image.');
      return;
    }

    setPhotoError('');
    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);
      await api.post('/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await refreshUser();
    } catch (err) {
      console.error(err);
      setPhotoError('Profile photo upload failed.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    try {
      setUploadingPhoto(true);
      await api.delete('/profile/photo');
      await refreshUser();
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExportingData(true);
      const res = await api.get('/transactions?limit=10000');
      const transactions = res.data?.data?.transactions || [];
      
      let csvContent = 'Date,Type,Description,Category,Payment Method,Amount\n';
      transactions.forEach(tx => {
        const date = new Date(tx.date).toLocaleDateString();
        const type = tx.type;
        const desc = `"${(tx.description || '').replace(/"/g, '""')}"`;
        const cat = `"${(tx.category?.name || 'Unknown').replace(/"/g, '""')}"`;
        const method = tx.paymentMethod;
        const amount = tx.amount;
        csvContent += `${date},${type},${desc},${cat},${method},${amount}\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'spendwise_transactions.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExportingData(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Page Header */}
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            Settings & Preferences
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage your account settings, localization preferences, and security
          </p>
        </div>

        {savedSuccess && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#34D399',
            fontSize: '14px'
          }}>
            <Check size={18} />
            <span>Preferences saved successfully!</span>
          </div>
        )}

        {/* Section 1: Profile Information */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <User size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Profile Information
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Your account identity details and photo
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>
                PROFILE PHOTO
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'center', border: '2px solid var(--accent-indigo)' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: '700' }}>
                    {user?.name?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/jpeg, image/png, image/webp" style={{ display: 'none' }} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'var(--accent-indigo)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '600', cursor: uploadingPhoto ? 'not-allowed' : 'pointer' }}>
                      <Upload size={14} /> {uploadingPhoto ? 'Uploading...' : (user?.profilePhoto ? 'Change Photo' : 'Upload Photo')}
                    </button>
                    {user?.profilePhoto && (
                      <button type="button" onClick={handleRemovePhoto} disabled={uploadingPhoto} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: 'transparent', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontWeight: '600', cursor: uploadingPhoto ? 'not-allowed' : 'pointer' }}>
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </div>
                  {photoError && <span style={{ color: '#EF4444', fontSize: '11px' }}>{photoError}</span>}
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>JPG, PNG or WEBP under 5MB</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
                FULL NAME
              </label>
              <input
                type="text"
                readOnly
                value={user?.name || ''}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="text"
                readOnly
                value={user?.email || ''}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'not-allowed'
                }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Regional Preferences */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Globe size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Regional & Display Preferences
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Customize currency and date display formats
              </span>
            </div>
          </div>

          <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Preferred Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="INR" style={{ backgroundColor: '#1E293B' }}>₹ Indian Rupee (INR)</option>
                  <option value="USD" style={{ backgroundColor: '#1E293B' }}>$ US Dollar (USD)</option>
                  <option value="EUR" style={{ backgroundColor: '#1E293B' }}>€ Euro (EUR)</option>
                  <option value="GBP" style={{ backgroundColor: '#1E293B' }}>£ British Pound (GBP)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="DD/MM/YYYY" style={{ backgroundColor: '#1E293B' }}>DD/MM/YYYY (e.g. 05/10/2026)</option>
                  <option value="MM/DD/YYYY" style={{ backgroundColor: '#1E293B' }}>MM/DD/YYYY (e.g. 10/05/2026)</option>
                  <option value="YYYY-MM-DD" style={{ backgroundColor: '#1E293B' }}>YYYY-MM-DD (e.g. 2026-10-05)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'var(--accent-indigo)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: Data Privacy & Security */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Shield size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Data Isolation & Security
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Protected financial database architecture
              </span>
            </div>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
            Your account is strictly isolated using cryptographic JSON Web Tokens (JWT) and MongoDB database indexing. Transactions, categories, and budget data are private and accessible only via your authenticated session.
          </p>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Export Data
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Download a complete archive of your transaction history in CSV format.
            </p>
            <button
              onClick={handleExportData}
              disabled={exportingData}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)',
                border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
                fontSize: '13px', fontWeight: '600', cursor: exportingData ? 'not-allowed' : 'pointer'
              }}
            >
              <Download size={16} /> {exportingData ? 'Exporting...' : 'Export Transactions (CSV)'}
            </button>
          </div>
        </div>

        {/* Section 4: Account Actions / Logout */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#EF4444', margin: 0 }}>
              Sign Out of Session
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Safely terminate your authenticated session on this browser
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-md)',
              color: '#EF4444',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
