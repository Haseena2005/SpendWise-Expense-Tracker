import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        gap: '16px'
      }}>
        <Loader2 size={40} className="animate-spin" color="var(--accent-indigo)" />
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Loading SpendWise...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
