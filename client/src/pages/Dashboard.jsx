import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import TransactionForm from '../components/transactions/TransactionForm';
import BudgetForm from '../components/budgets/BudgetForm';
import SavingsGoalForm from '../components/goals/SavingsGoalForm';
import RecurringModal from '../components/recurring/RecurringModal';
import HealthScoreCard from '../components/insights/HealthScoreCard';
import SmartInsightsCard from '../components/insights/SmartInsightsCard';

import { 
  Plus, ArrowDownCircle, ArrowUpCircle, AlertCircle, RefreshCw, 
  Wallet, Calendar, Receipt, Target, Repeat, ArrowRight, 
  Sparkles, CheckCircle2, TrendingUp 
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, getActiveCurrencySymbol } from '../utils/formatters';

export default function Dashboard() {
  const { user, currency } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [recurringList, setRecurringList] = useState([]);
  const [insights, setInsights] = useState([]);
  const [healthData, setHealthData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txModalType, setTxModalType] = useState('expense');
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [recurringModalOpen, setRecurringModalOpen] = useState(false);

  const currencySymbol = getActiveCurrencySymbol(currency);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        analyticsRes,
        transactionsRes,
        goalsRes,
        recurringRes,
        insightsRes,
        healthRes
      ] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/transactions?limit=5'),
        api.get('/savings-goals'),
        api.get('/recurring-transactions'),
        api.get('/insights'),
        api.get('/financial-health')
      ]);

      setAnalytics(analyticsRes.data?.data);
      setRecentTransactions(transactionsRes.data?.data?.transactions || []);
      setSavingsGoals(goalsRes.data?.data || []);
      setRecurringList(recurringRes.data?.data || []);
      setInsights(insightsRes.data?.data || []);
      setHealthData(healthRes.data?.data || null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currency]);

  const openTxModal = (type) => {
    setTxModalType(type);
    setTxModalOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="empty-state">
          <AlertCircle className="empty-icon" style={{ color: 'var(--accent-expense)' }} />
          <h2>Failed to load data</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchDashboardData} style={{ marginTop: '16px' }}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* 1. Header with Personal Welcome & Main Action Triggers */}
        <header className="page-header" style={{ marginBottom: 0 }}>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">
              Welcome, {user?.name || 'User'}! Here's your financial workspace in <strong>{currency} ({currencySymbol})</strong>.
            </p>
          </div>
          <div className="quick-actions">
            <button className="btn btn-income" onClick={() => openTxModal('income')}>
              <ArrowUpCircle size={18} /> Add Income
            </button>
            <button className="btn btn-expense" onClick={() => openTxModal('expense')}>
              <ArrowDownCircle size={18} /> Add Expense
            </button>
          </div>
        </header>

        {/* 2. Primary Financial Summary Cards */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon balance" style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {currencySymbol}
            </div>
            <div>
              <div className="summary-label">Total Balance</div>
              <div className="summary-value" style={{ color: (analytics?.balance ?? 0) >= 0 ? 'var(--text-primary)' : 'var(--accent-expense)' }}>
                {formatCurrency(analytics?.balance ?? 0)}
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon income">
              <ArrowUpCircle size={28} />
            </div>
            <div>
              <div className="summary-label">Total Income</div>
              <div className="summary-value">{formatCurrency(analytics?.totalIncome ?? 0)}</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon expense">
              <ArrowDownCircle size={28} />
            </div>
            <div>
              <div className="summary-label">Total Expense</div>
              <div className="summary-value">{formatCurrency(analytics?.totalExpense ?? 0)}</div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon count" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>💰</div>
            <div>
              <div className="summary-label">Net Savings</div>
              <div className="summary-value" style={{ fontSize: '20px', color: ((analytics?.totalIncome ?? 0) - (analytics?.totalExpense ?? 0)) >= 0 ? '#10B981' : '#EF4444' }}>
                {formatCurrency((analytics?.totalIncome ?? 0) - (analytics?.totalExpense ?? 0))}
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon count" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>📈</div>
            <div>
              <div className="summary-label">Savings Rate</div>
              <div className="summary-value" style={{ fontSize: '20px' }}>
                {analytics?.totalIncome > 0 
                  ? `${(((analytics.totalIncome - (analytics?.totalExpense ?? 0)) / analytics.totalIncome) * 100).toFixed(1)}%` 
                  : '0.0%'}
              </div>
            </div>
          </div>
        </div>



        {/* 4. Financial Health Score & Smart Insights Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          <HealthScoreCard healthData={healthData} loading={false} />
          <SmartInsightsCard insights={insights} loading={false} />
        </div>

        {/* 5. Savings Goals & Recurring Subscriptions Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {/* Savings Goals Card */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Target size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    Savings Goals
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Track target progress</span>
                </div>
              </div>
              <button
                onClick={() => setGoalModalOpen(true)}
                style={{
                  background: 'transparent', border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)', padding: '4px 10px',
                  borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <Plus size={14} /> New Goal
              </button>
            </div>

            {savingsGoals.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Target size={24} style={{ opacity: 0.3, marginBottom: '6px' }} />
                <p style={{ fontSize: '13px', margin: 0 }}>No savings goals created yet.</p>
                <button
                  onClick={() => setGoalModalOpen(true)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--accent-indigo)',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer', marginTop: '6px'
                  }}
                >
                  + Set your first goal
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {savingsGoals.slice(0, 3).map(goal => (
                  <div key={goal._id} style={{
                    padding: '12px 14px', backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {goal.name}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: goal.progress >= 100 ? '#10B981' : 'var(--accent-indigo)' }}>
                        {goal.progress}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '3px', overflow: 'hidden', marginBottom: '8px'
                    }}>
                      <div style={{
                        height: '100%', width: `${goal.progress}%`,
                        backgroundColor: goal.progress >= 100 ? '#10B981' : 'var(--accent-indigo)',
                        borderRadius: '3px', transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                      <span>Target: {formatDate(goal.targetDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recurring Transactions Card */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Repeat size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    Recurring Bills & Subs
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Scheduled commitments</span>
                </div>
              </div>
              <button
                onClick={() => setRecurringModalOpen(true)}
                style={{
                  background: 'transparent', border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)', padding: '4px 10px',
                  borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}
              >
                <Plus size={14} /> Add Recurring
              </button>
            </div>

            {recurringList.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Repeat size={24} style={{ opacity: 0.3, marginBottom: '6px' }} />
                <p style={{ fontSize: '13px', margin: 0 }}>No recurring bills or subscriptions.</p>
                <button
                  onClick={() => setRecurringModalOpen(true)}
                  style={{
                    background: 'transparent', border: 'none', color: 'var(--accent-indigo)',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer', marginTop: '6px'
                  }}
                >
                  + Add subscription or rent
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recurringList.slice(0, 3).map(rec => (
                  <div key={rec._id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)'
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {rec.description}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {rec.frequency.toUpperCase()} • Next: {formatDate(rec.nextOccurrence)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: rec.type === 'income' ? '#10B981' : '#EF4444' }}>
                        {rec.type === 'income' ? '+' : '-'}{formatCurrency(rec.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 6. Recent Transactions Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 className="chart-title" style={{ marginBottom: 0 }}>Recent Activity</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Latest transactions in {currency}</span>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate('/transactions')}>View All</button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-icon" style={{ fontSize: '32px' }}>📝</div>
              <h3 style={{ fontSize: '16px' }}>No transactions yet</h3>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Add your first income or expense to get started.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                <button className="btn btn-sm btn-income" onClick={() => openTxModal('income')}>
                  + Add Income
                </button>
                <button className="btn btn-sm btn-expense" onClick={() => openTxModal('expense')}>
                  + Add Expense
                </button>
              </div>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map(tx => (
                    <tr key={tx._id}>
                      <td>
                        <div style={{ fontWeight: '600' }}>{tx.description}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tx.notes || '-'}</div>
                      </td>
                      <td>
                        <span className={`badge badge-category`}>
                          {tx.category?.name || 'Unknown'}
                        </span>
                      </td>
                      <td>{formatDate(tx.date)}</td>
                      <td>{tx.paymentMethod}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: tx.type === 'income' ? 'var(--accent-income)' : 'var(--accent-expense)' }}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TransactionForm
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        onTransactionSaved={fetchDashboardData}
        initialType={txModalType}
      />

      <BudgetForm
        isOpen={budgetModalOpen}
        onClose={() => setBudgetModalOpen(false)}
        onBudgetSaved={fetchDashboardData}
      />

      <SavingsGoalForm
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onGoalSaved={fetchDashboardData}
      />

      <RecurringModal
        isOpen={recurringModalOpen}
        onClose={() => setRecurringModalOpen(false)}
        onSaved={fetchDashboardData}
      />
    </DashboardLayout>
  );
}
