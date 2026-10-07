import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { getActiveCurrencySymbol } from '../../utils/formatters';

export default function SavingsGoalForm({ isOpen, onClose, onGoalSaved, editingGoal = null }) {
  const { currency } = useAuth();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currencySymbol = getActiveCurrencySymbol(currency);

  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        setName(editingGoal.name || '');
        setTargetAmount(editingGoal.targetAmount?.toString() || '');
        setCurrentAmount(editingGoal.currentAmount?.toString() || '0');
        setTargetDate(editingGoal.targetDate ? new Date(editingGoal.targetDate).toISOString().split('T')[0] : '');
        setDescription(editingGoal.description || '');
      } else {
        setName('');
        setTargetAmount('');
        setCurrentAmount('0');
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        setTargetDate(nextYear.toISOString().split('T')[0]);
        setDescription('');
      }
      setError('');
    }
  }, [isOpen, editingGoal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;

    if (!name || isNaN(target) || target <= 0 || !targetDate) {
      setError('Please fill in all required fields with valid amounts.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (editingGoal) {
        await api.put(`/savings-goals/${editingGoal._id}`, {
          name,
          targetAmount: target,
          currentAmount: current,
          targetDate,
          description
        });
      } else {
        await api.post('/savings-goals', {
          name,
          targetAmount: target,
          currentAmount: current,
          targetDate,
          description
        });
      }

      onGoalSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save savings goal.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
        width: '100%',
        maxWidth: '460px',
        padding: '24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            {editingGoal ? 'Edit Savings Goal' : 'Add New Savings Goal'}
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#F87171',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Goal Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Emergency Fund, Vacation, New Laptop"
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Target Amount ({currencySymbol})
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="100000"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Current Saved ({currencySymbol})
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="25000"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Target Date
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Description / Note (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 6 months of basic living expenses"
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: 'var(--accent-indigo)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {editingGoal ? 'Update Goal' : 'Save Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
