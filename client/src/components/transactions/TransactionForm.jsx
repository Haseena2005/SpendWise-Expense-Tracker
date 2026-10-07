import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../services/api';

export default function TransactionForm({ isOpen, onClose, transaction, onSuccess, onTransactionSaved, initialType = 'expense' }) {
  const [formData, setFormData] = useState({
    type: initialType,
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Card',
    notes: ''
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories when type changes
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchCategories = async () => {
      try {
        const res = await api.get(`/categories?type=${formData.type}`);
        const cats = res.data.data || [];
        setCategories(cats);
        // Reset category if the current one is not in the new list
        if (formData.category && !cats.find(c => c._id === formData.category)) {
          setFormData(prev => ({ ...prev, category: '' }));
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    
    fetchCategories();
  }, [formData.type, isOpen]);

  // Populate form if editing
  useEffect(() => {
    if (transaction && isOpen) {
      setFormData({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category?._id || transaction.category,
        description: transaction.description,
        date: new Date(transaction.date).toISOString().split('T')[0],
        paymentMethod: transaction.paymentMethod,
        notes: transaction.notes || ''
      });
    } else if (isOpen) {
      setFormData({
        type: initialType || 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Card',
        notes: ''
      });
      setError('');
    }
  }, [transaction, isOpen, initialType]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (transaction) {
        await api.put(`/transactions/${transaction._id}`, formData);
      } else {
        await api.post('/transactions', formData);
      }
      if (onSuccess) onSuccess();
      if (onTransactionSaved) onTransactionSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{transaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>
        
        {error && <div className="toast-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="type-tabs">
            <div 
              className={`type-tab ${formData.type === 'income' ? 'active-income' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              style={{ cursor: 'pointer' }}
            >
              Income
            </div>
            <div 
              className={`type-tab ${formData.type === 'expense' ? 'active-expense' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              style={{ cursor: 'pointer' }}
            >
              Expense
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount</label>
              <input 
                type="number" 
                name="amount" 
                className="form-control" 
                placeholder="0.00" 
                min="0.01" 
                step="0.01" 
                required 
                value={formData.amount} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input 
                type="date" 
                name="date" 
                className="form-control" 
                required 
                value={formData.date} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input 
              type="text" 
              name="description" 
              className="form-control" 
              placeholder="e.g., Groceries, Salary..." 
              required 
              value={formData.description} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                name="category" 
                className="form-control" 
                required 
                value={formData.category} 
                onChange={handleChange}
              >
                <option value="" disabled>Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select 
                name="paymentMethod" 
                className="form-control" 
                value={formData.paymentMethod} 
                onChange={handleChange}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea 
              name="notes" 
              className="form-control" 
              rows="2" 
              placeholder="Additional details..." 
              value={formData.notes} 
              onChange={handleChange} 
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className={`btn ${formData.type === 'income' ? 'btn-income' : 'btn-expense'}`} disabled={loading}>
              {loading ? 'Saving...' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
