import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Plus, Edit2, Trash2, AlertCircle, RefreshCw, Tag, X } from 'lucide-react';
import api from '../services/api';
import CategoryForm from '../components/categories/CategoryForm';
import { getIconEmoji } from '../utils/iconMap';

// ── Delete confirmation dialog ──────────────────────────────────────────────
function DeleteConfirmModal({ category, onConfirm, onCancel }) {
  if (!category) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(239,68,68,0.15)', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Trash2 size={24} color="#ef4444" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Delete Category</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>"{category.name}"</strong>?
            <br />This action cannot be undone.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
          <button className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} style={{ flex: 1 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Category card ─────────────────────────────────────────────────────────
function CategoryCard({ cat, onEdit, onDelete }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 18px',
      borderRadius: 'var(--radius-md)',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border-light)',
      transition: 'all 0.2s',
    }}
    className="category-card"
    >
      {/* Icon blob */}
      <div style={{
        width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0,
        background: cat.color + '22',
        border: `1px solid ${cat.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px',
      }}>
        {getIconEmoji(cat.icon)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cat.name}</span>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: cat.color, display: 'inline-block', flexShrink: 0,
          }} />
        </div>
        {cat.description && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {cat.description}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <button
          onClick={() => onEdit(cat)}
          className="icon-btn"
          title="Edit"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Edit2 size={15} />
        </button>
        <button
          onClick={() => onDelete(cat)}
          className="icon-btn"
          title="Delete"
          style={{ color: 'var(--accent-expense)' }}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Section panel ─────────────────────────────────────────────────────────
function CategorySection({ title, subtitle, accentColor, categories, onAdd, onEdit, onDelete }) {
  return (
    <div className="card" style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{
            fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: accentColor, display: 'inline-block',
            }} />
            {title}
            <span style={{
              fontSize: '12px', fontWeight: 600,
              background: accentColor + '22', color: accentColor,
              padding: '2px 8px', borderRadius: '20px',
            }}>
              {categories.length}
            </span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle}</p>
        </div>
        <button className="btn btn-sm btn-secondary" onClick={onAdd} style={{ flexShrink: 0 }}>
          <Plus size={14} /> Add
        </button>
      </div>

      {categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
          <Tag size={32} style={{ marginBottom: '10px', opacity: 0.4 }} />
          <p style={{ fontSize: '14px' }}>No {title.toLowerCase()} yet.</p>
          <button className="btn btn-sm btn-secondary" onClick={onAdd} style={{ marginTop: '12px' }}>
            <Plus size={14} /> Create one
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {categories.map(cat => (
            <CategoryCard key={cat._id} cat={cat} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function Categories() {
  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [defaultType, setDefaultType] = useState('expense');

  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // ── Fetch all categories ──────────────────────────────────────────────
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/categories');
      const all = res.data.data || [];
      setIncomeCategories(all.filter(c => c.type === 'income'));
      setExpenseCategories(all.filter(c => c.type === 'expense'));
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  // ── Open form for add ─────────────────────────────────────────────────
  const handleAdd = (type) => {
    setDefaultType(type);
    setEditingCategory(null);
    setFormOpen(true);
  };

  // ── Open form for edit ────────────────────────────────────────────────
  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setFormOpen(true);
  };

  // ── Delete flow ───────────────────────────────────────────────────────
  const handleDeleteRequest = (cat) => {
    setDeleteError(null);
    setDeletingCategory(cat);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/categories/${deletingCategory._id}`);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      // 409 = category has transactions
      const msg = err.message || 'Failed to delete category';
      setDeleteError(msg);
      setDeletingCategory(null);
    }
  };

  return (
    <DashboardLayout>
      <header className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organise your income and expense categories.</p>
        </div>
      </header>

      {/* Global delete error banner */}
      {deleteError && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '12px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: '24px',
        }}>
          <AlertCircle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#fca5a5', marginBottom: '4px' }}>Cannot Delete Category</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {deleteError}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Tip: Reassign or delete the linked transactions first, then try again.
            </div>
          </div>
          <button
            onClick={() => setDeleteError(null)}
            style={{ background: 'transparent', color: 'var(--text-muted)', flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : error ? (
        <div className="empty-state">
          <AlertCircle size={40} color="var(--accent-expense)" style={{ marginBottom: '16px' }} />
          <h3>{error}</h3>
          <button className="btn btn-secondary" onClick={fetchCategories} style={{ marginTop: '12px' }}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
          <CategorySection
            title="Income Categories"
            subtitle="Sources of money coming in"
            accentColor="var(--accent-income)"
            categories={incomeCategories}
            onAdd={() => handleAdd('income')}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
          <CategorySection
            title="Expense Categories"
            subtitle="Where your money goes"
            accentColor="var(--accent-expense)"
            categories={expenseCategories}
            onAdd={() => handleAdd('expense')}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        </div>
      )}

      {/* Form modal */}
      <CategoryForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        category={editingCategory}
        defaultType={defaultType}
        onSuccess={fetchCategories}
      />

      {/* Delete confirmation */}
      <DeleteConfirmModal
        category={deletingCategory}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingCategory(null)}
      />

      <style>{`
        .category-card:hover {
          border-color: rgba(99, 102, 241, 0.3) !important;
          background: rgba(255,255,255,0.05) !important;
        }
        .icon-btn {
          width: 30px; height: 30px;
          border-radius: var(--radius-sm);
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .icon-btn:hover { background: rgba(255,255,255,0.08); }
      `}</style>
    </DashboardLayout>
  );
}
