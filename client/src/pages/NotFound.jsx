import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#EF4444',
        marginBottom: '20px'
      }}>
        <AlertCircle size={32} />
      </div>

      <h1 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 8px' }}>
        404 - Page Not Found
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 0 24px', lineHeight: '1.5' }}>
        The page you are looking for doesn't exist or has been moved.
      </p>

      <Link
        to="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          backgroundColor: 'var(--accent-indigo)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '14px'
        }}
      >
        <Home size={18} />
        Back to Dashboard
      </Link>
    </div>
  );
}
