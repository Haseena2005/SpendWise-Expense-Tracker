import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Plus, Edit2, Trash2, Search, Filter, AlertCircle, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../services/api';
import TransactionForm from '../components/transactions/TransactionForm';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    sortBy: 'date_desc'
  });
  
  const [categories, setCategories] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.type && { type: filters.type }),
        ...(filters.category && { category: filters.category }),
        ...(filters.sortBy && { sortBy: filters.sortBy })
      }).toString();

      const res = await api.get(`/transactions?${queryParams}`);
      setTransactions(res.data.data.transactions);
      setPagination({
        page: res.data.data.pagination.currentPage,
        limit: res.data.data.pagination.limit,
        totalPages: res.data.data.pagination.totalPages,
        totalItems: res.data.data.pagination.totalItems
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, filters.type, filters.category, filters.sortBy]); // search triggers manually or on blur to prevent debounce issues

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTransactions();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      alert('Failed to delete transaction: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // reset page on filter change
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <DashboardLayout>
      <header className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Manage and track your income and expenses.</p>
        </div>
        <div className="quick-actions">
          <button className="btn btn-primary" onClick={handleAddNew}>
            <Plus size={18} /> Add Transaction
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              name="search"
              placeholder="Search by description or notes..." 
              className="form-control"
              style={{ paddingLeft: '36px' }}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
        
        <div className="filter-grid">
          <select name="type" className="form-control" value={filters.type} onChange={handleFilterChange}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select name="category" className="form-control" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            {categories
              .filter(cat => !filters.type || cat.type === filters.type)
              .map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <select name="sortBy" className="form-control" value={filters.sortBy} onChange={handleFilterChange}>
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="toast-error" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} /> {error}
          <button className="btn btn-sm btn-secondary" onClick={fetchTransactions} style={{ marginLeft: 'auto' }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No transactions found</h3>
            <p>Try adjusting your filters or add a new transaction.</p>
            {Object.values(filters).some(v => v !== '' && v !== 'date_desc') && (
              <button 
                className="btn btn-secondary" 
                style={{ marginTop: '16px' }}
                onClick={() => setFilters({ search: '', type: '', category: '', sortBy: 'date_desc' })}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx._id}>
                    <td>
                      <div style={{ fontWeight: '600' }}>{tx.description}</div>
                      {tx.notes && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tx.notes}</div>}
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
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button 
                          onClick={() => handleEdit(tx)}
                          style={{ background: 'transparent', color: 'var(--text-secondary)' }}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(tx._id)}
                          style={{ background: 'transparent', color: 'var(--accent-expense)' }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && transactions.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} results
            </div>
            <div className="pagination-buttons">
              <button 
                className="btn btn-secondary btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                <ArrowLeft size={16} />
              </button>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  className={`page-num ${pagination.page === i + 1 ? 'active' : ''}`}
                  onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                className="btn btn-secondary btn-sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        transaction={editingTransaction}
        onSuccess={fetchTransactions}
      />
    </DashboardLayout>
  );
}
