import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import BudgetForm from '../components/budgets/BudgetForm';
import api from '../services/api';
import { 
  Wallet, Plus, Edit2, Trash2, AlertCircle, 
  CheckCircle2, AlertTriangle, TrendingUp, Calendar, Loader2 
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export default function Budgets() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [budgetData, setBudgetData] = useState({ budgets: [], totalBudget: 0, totalSpent: 0, remainingBudget: 0, overallProgress: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`);
      if (res.data?.success) {
        setBudgetData(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load budgets.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/budgets/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchBudgets();
    } catch (err) {
      setError(err.message || 'Failed to delete budget.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 100) return '#EF4444'; // Red (exceeded)
    if (progress >= 80) return '#F59E0B';  // Warning amber
    return '#10B981';                      // Healthy green
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Header with Title & Actions */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          justifyContent: 'space-between'
        }} className="header-flex">
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Monthly Budgets
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Set category spending limits and monitor real-time monthly progress
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Month/Year Selectors */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-card)', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <Calendar size={16} color="var(--accent-indigo)" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
              >
                {months.map((m, idx) => (
                  <option key={idx + 1} value={idx + 1} style={{ backgroundColor: '#1E293B' }}>{m}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', cursor: 'pointer' }}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y} style={{ backgroundColor: '#1E293B' }}>{y}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setEditingBudget(null);
                setIsModalOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                backgroundColor: 'var(--accent-indigo)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
            >
              <Plus size={18} />
              Set Budget
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#F87171',
            fontSize: '14px'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* KPI Overview Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Allocated Budget</span>
            <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '8px', marginBottom: 0 }}>
              {formatCurrency(budgetData.totalBudget)}
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Spent This Month</span>
            <p style={{ fontSize: '24px', fontWeight: '800', color: '#EF4444', marginTop: '8px', marginBottom: 0 }}>
              {formatCurrency(budgetData.totalSpent)}
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Remaining Balance</span>
            <p style={{ fontSize: '24px', fontWeight: '800', color: budgetData.remainingBudget >= 0 ? '#10B981' : '#EF4444', marginTop: '8px', marginBottom: 0 }}>
              {formatCurrency(budgetData.remainingBudget)}
            </p>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Budget Utilization</span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: getProgressColor(budgetData.overallProgress) }}>
                {budgetData.overallProgress}%
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              marginTop: '12px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(budgetData.overallProgress, 100)}%`,
                backgroundColor: getProgressColor(budgetData.overallProgress),
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Budgets List Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px' }}>
            <Loader2 size={36} className="animate-spin" color="var(--accent-indigo)" />
          </div>
        ) : budgetData.budgets.length === 0 ? (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '48px 24px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-indigo)',
              marginBottom: '16px'
            }}>
              <Wallet size={28} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              No budgets set for {months[selectedMonth - 1]} {selectedYear}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 20px' }}>
              Set category spending limits to keep track of where your money goes each month.
            </p>
            <button
              onClick={() => {
                setEditingBudget(null);
                setIsModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: 'var(--accent-indigo)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              Set First Budget
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {budgetData.budgets.map((b) => {
              const categoryColor = b.category?.color || '#64748B';
              const progressColor = getProgressColor(b.progress);
              const isOver = b.spent > b.amount;

              return (
                <div
                  key={b._id}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '24px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                >
                  {/* Category Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: `${categoryColor}20`,
                        border: `1px solid ${categoryColor}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: categoryColor
                      }}>
                        <Wallet size={20} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                          {b.category?.name || 'Uncategorized'}
                        </h3>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {months[b.month - 1]} {b.year}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => {
                          setEditingBudget(b);
                          setIsModalOpen(true);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px'
                        }}
                        title="Edit Budget"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(b)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#F87171',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px'
                        }}
                        title="Delete Budget"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Spent / Budget</span>
                      <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {formatCurrency(b.spent)}
                      </span>
                      <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        {' '}/ {formatCurrency(b.amount)}
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>
                        {isOver ? 'Over Budget' : 'Remaining'}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: isOver ? '#EF4444' : '#10B981'
                      }}>
                        {isOver ? `+${formatCurrency(b.spent - b.amount)}` : formatCurrency(b.remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar & Percentage */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Usage</span>
                      <span style={{ fontWeight: '700', color: progressColor }}>{b.progress}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(b.progress, 100)}%`,
                        backgroundColor: progressColor,
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Budget Create/Edit Modal */}
      <BudgetForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBudgetSaved={fetchBudgets}
        editingBudget={editingBudget}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Delete Budget
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
              Are you sure you want to remove the budget for <strong>{deleteTarget.category?.name}</strong> for {months[deleteTarget.month - 1]} {deleteTarget.year}?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBudget}
                disabled={deleteLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  backgroundColor: '#EF4444',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: deleteLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {deleteLoading && <Loader2 size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 640px) {
          .header-flex {
            flex-direction: row !important;
            align-items: center !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
