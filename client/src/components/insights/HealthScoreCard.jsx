import React from 'react';
import { ShieldCheck, Info, Sparkles, CheckCircle2 } from 'lucide-react';

export default function HealthScoreCard({ healthData, loading }) {
  if (loading) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px'
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const score = healthData?.score ?? 0;
  const status = healthData?.status || 'Good';
  const color = healthData?.color || '#10B981';
  const summary = healthData?.summary || 'Your spending is currently balanced and within healthy limits.';
  const tips = healthData?.tips || [];

  // SVG Circular progress computation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
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
            backgroundColor: `${color}20`, color,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Financial Health Score
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Personal tracking assessment</span>
          </div>
        </div>
        <span style={{
          fontSize: '12px',
          fontWeight: '700',
          padding: '4px 10px',
          borderRadius: '12px',
          backgroundColor: `${color}20`,
          color
        }}>
          {status}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Progress Ring */}
        <div style={{ position: 'relative', width: '96px', height: '96px', flexShrink: 0 }}>
          <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke={color}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>/ 100</span>
          </div>
        </div>

        {/* Summary text & recommendations */}
        <div style={{ flex: 1, minWidth: '180px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 8px' }}>
            {summary}
          </p>
          {tips.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <Sparkles size={14} color={color} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{tips[0]}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
