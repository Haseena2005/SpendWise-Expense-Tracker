import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { AlertCircle, RefreshCw, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import IncomeVsExpenseChart from '../components/charts/IncomeVsExpenseChart';
import CategoryExpenseChart from '../components/charts/CategoryExpenseChart';
import MonthlyTrendChart from '../components/charts/MonthlyTrendChart';
import YearlyTrendChart from '../components/charts/YearlyTrendChart';
import { formatCurrency } from '../components/charts/ChartUtils';
import api from '../services/api';

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/dashboard');
      setDashboard(res.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const overviewCards = dashboard
    ? [
        {
          label: 'Total Income',
          value: formatCurrency(dashboard.totalIncome),
          icon: TrendingUp,
          color: '#10b981',
          bg: 'rgba(16,185,129,0.12)',
          sub: `This month: ${formatCurrency(dashboard.currentMonthIncome)}`,
        },
        {
          label: 'Total Expenses',
          value: formatCurrency(dashboard.totalExpense),
          icon: TrendingDown,
          color: '#ef4444',
          bg: 'rgba(239,68,68,0.12)',
          sub: `This month: ${formatCurrency(dashboard.currentMonthExpense)}`,
        },
        {
          label: 'Net Balance',
          value: formatCurrency(dashboard.balance),
          icon: DollarSign,
          color: '#6366f1',
          bg: 'rgba(99,102,241,0.12)',
          sub: dashboard.balance >= 0 ? 'You\'re in the green 🎉' : 'Spending exceeds income',
        },
      ]
    : [];

  return (
    <DashboardLayout>
      <header className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Visual insights from your financial data — powered by MongoDB aggregation.</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchDashboard}>
          <RefreshCw size={14} /> Refresh
        </button>
      </header>

      {/* Overview stat cards */}
      {error ? (
        <div className="toast-error" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <AlertCircle size={20} /> {error}
          <button className="btn btn-sm btn-secondary" onClick={fetchDashboard} style={{ marginLeft: 'auto' }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : loading ? (
        <div className="summary-grid" style={{ marginBottom: '28px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="summary-card" style={{ height: '88px' }}>
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%)',
                backgroundSize: '200%', animation: 'shimmer 1.6s infinite', borderRadius: 'var(--radius-md)',
              }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="summary-grid" style={{ marginBottom: '28px' }}>
          {overviewCards.map((c, i) => (
            <div key={i} className="summary-card" style={{ position: 'relative', overflow: 'hidden' }}>
              {/* Glow orb */}
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: c.color, opacity: 0.08, pointerEvents: 'none',
              }} />
              <div className="summary-icon" style={{ background: c.bg, color: c.color }}>
                <c.icon size={24} />
              </div>
              <div>
                <div className="summary-label">{c.label}</div>
                <div className="summary-value" style={{ color: c.color }}>{c.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts - row 1 */}
      <div className="charts-grid" style={{ marginBottom: '24px' }}>
        <IncomeVsExpenseChart />
        <CategoryExpenseChart />
      </div>

      {/* Charts - row 2 (full width) */}
      <div style={{ marginBottom: '24px' }}>
        <MonthlyTrendChart />
      </div>

      {/* Charts - row 3 (full width) */}
      <div>
        <YearlyTrendChart />
      </div>

      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </DashboardLayout>
  );
}
