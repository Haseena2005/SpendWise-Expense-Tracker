import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import api from '../../services/api';
import { ICON_OPTIONS, COLOR_OPTIONS, getIconEmoji } from '../../utils/iconMap';

export default function CategoryForm({ isOpen, onClose, category, defaultType = 'expense', onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    description: '',
    icon: 'tag',
    color: '#6366F1',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name: category.name,
        type: category.type,
        description: category.description || '',
        icon: category.icon || 'tag',
        color: category.color || '#6366F1',
      });
    } else if (isOpen) {
      setFormData({ name: '', type: defaultType, description: '', icon: 'tag', color: '#6366F1' });
      setError('');
    }
  }, [category, isOpen]);

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
      if (category) {
        await api.put(`/categories/${category._id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{category ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
            <X size={20} />
          </button>
        </div>

        {error && <div className="toast-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Type switcher */}
          <div className="type-tabs" style={{ marginBottom: '20px' }}>
            <div
              className={`type-tab ${formData.type === 'income' ? 'active-income' : ''}`}
              onClick={() => !category && setFormData(prev => ({ ...prev, type: 'income' }))}
              style={{ cursor: category ? 'not-allowed' : 'pointer', opacity: category ? 0.6 : 1 }}
              title={category ? 'Cannot change type of existing category' : ''}
            >
              Income
            </div>
            <div
              className={`type-tab ${formData.type === 'expense' ? 'active-expense' : ''}`}
              onClick={() => !category && setFormData(prev => ({ ...prev, type: 'expense' }))}
              style={{ cursor: category ? 'not-allowed' : 'pointer', opacity: category ? 0.6 : 1 }}
              title={category ? 'Cannot change type of existing category' : ''}
            >
              Expense
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input
              type="text" name="name" className="form-control"
              placeholder="e.g., Groceries, Salary…"
              required maxLength={50}
              value={formData.name} onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <input
              type="text" name="description" className="form-control"
              placeholder="Short description…"
              maxLength={200}
              value={formData.description} onChange={handleChange}
            />
          </div>

          {/* Color picker */}
          <div className="form-group">
            <label className="form-label">Color</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c} type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: c }))}
                  style={{
                    width: 28, height: 28, borderRadius: '50%', background: c,
                    border: formData.color === c ? '3px solid white' : '2px solid transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: formData.color === c ? `0 0 0 2px ${c}` : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {formData.color === c && <Check size={12} color="white" strokeWidth={3} />}
                </button>
              ))}
              <input
                type="color" value={formData.color}
                onChange={e => setFormData(prev => ({ ...prev, color: e.target.value }))}
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'transparent', padding: 0 }}
                title="Custom color"
              />
            </div>
          </div>

          {/* Icon picker */}
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {ICON_OPTIONS.map(ic => (
                <button
                  key={ic.key} type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon: ic.key }))}
                  title={ic.key}
                  style={{
                    width: 38, height: 38, borderRadius: 'var(--radius-sm)',
                    background: formData.icon === ic.key ? formData.color : 'rgba(255,255,255,0.06)',
                    border: formData.icon === ic.key ? `2px solid ${formData.color}` : '2px solid transparent',
                    cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {ic.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.04)', marginBottom: '20px',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-md)',
              background: formData.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', border: `1px solid ${formData.color}44`,
            }}>
              {getIconEmoji(formData.icon)}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: formData.color }}>{formData.name || 'Category Name'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{formData.type} · {formData.description || 'No description'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className={`btn ${formData.type === 'income' ? 'btn-income' : 'btn-expense'}`} disabled={loading}>
              {loading ? 'Saving…' : category ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
