import React from 'react';
import { formatCurrency as globalFormatCurrency, formatCompactCurrency } from '../../utils/formatters';

/**
 * Shared chart tooltip for consistent dark-theme styling.
 */
export function ChartTooltip({ active, payload, label, formatter, currency }) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid rgba(99, 102, 241, 0.3)',
      borderRadius: '10px',
      padding: '12px 16px',
      fontSize: '13px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(8px)',
    }}>
      {label && (
        <p style={{ color: '#94a3b8', marginBottom: '8px', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: i < payload.length - 1 ? '4px' : 0 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, display: 'inline-block' }} />
          <span style={{ color: '#cbd5e1' }}>{entry.name}:</span>
          <span style={{ color: '#f8fafc', fontWeight: 700 }}>
            {formatter ? formatter(entry.value, entry.name) : globalFormatCurrency(entry.value, currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Reusable chart card wrapper.
 */
export function ChartCard({ title, subtitle, children, controls }) {
  return (
    <div className="chart-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="chart-title" style={{ marginBottom: 0 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle}</p>}
        </div>
        {controls && <div>{controls}</div>}
      </div>
      {children}
    </div>
  );
}

/**
 * Chart loading skeleton.
 */
export function ChartLoading({ height = 280 }) {
  return (
    <div style={{
      height,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.6s infinite',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="spinner" />
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </div>
  );
}

/**
 * Chart empty / error state.
 */
export function ChartEmpty({ icon = '📊', message = 'No data available', hint }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>{icon}</div>
      <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>{message}</p>
      {hint && <p style={{ fontSize: '13px' }}>{hint}</p>}
    </div>
  );
}

/**
 * Reusable year/month selector controls.
 */
export function YearSelector({ year, onChange, style }) {
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 4; y--) years.push(y);

  return (
    <select
      className="form-control"
      value={year}
      onChange={e => onChange(Number(e.target.value))}
      style={{ padding: '6px 12px', fontSize: '13px', width: 'auto', ...style }}
    >
      {years.map(y => <option key={y} value={y}>{y}</option>)}
    </select>
  );
}

export function MonthSelector({ month, onChange }) {
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  return (
    <select
      className="form-control"
      value={month}
      onChange={e => onChange(Number(e.target.value))}
      style={{ padding: '6px 12px', fontSize: '13px', width: 'auto' }}
    >
      {months.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
    </select>
  );
}

export const formatCurrency = globalFormatCurrency;

export const CHART_COLORS = {
  income:  '#10b981',
  expense: '#ef4444',
  balance: '#6366f1',
  indigo:  '#6366f1',
  purple:  '#8b5cf6',
  cyan:    '#06b6d4',
  amber:   '#f59e0b',
  pink:    '#ec4899',
};

export const PIE_PALETTE = [
  '#6366f1','#10b981','#ef4444','#f59e0b',
  '#ec4899','#8b5cf6','#06b6d4','#f97316',
  '#14b8a6','#64748b',
];
