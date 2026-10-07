import React from 'react';
import { 
  Sparkles, TrendingUp, AlertTriangle, ArrowDownRight, 
  ArrowUpRight, PieChart, Receipt, Lightbulb 
} from 'lucide-react';

export default function SmartInsightsCard({ insights = [], loading }) {
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

  const getIcon = (iconName, color) => {
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp size={16} color={color} />;
      case 'AlertTriangle': return <AlertTriangle size={16} color={color} />;
      case 'ArrowDownRight': return <ArrowDownRight size={16} color={color} />;
      case 'ArrowUpRight': return <ArrowUpRight size={16} color={color} />;
      case 'PieChart': return <PieChart size={16} color={color} />;
      case 'Receipt': return <Receipt size={16} color={color} />;
      default: return <Lightbulb size={16} color={color} />;
    }
  };

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Sparkles size={18} />
        </div>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            Smart Financial Insights
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Automated MongoDB transaction analysis</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {insights.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Add transactions this month to unlock personalized smart insights.
          </p>
        ) : (
          insights.slice(0, 3).map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '10px 12px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: `${item.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '1px'
              }}>
                {getIcon(item.icon, item.color)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 2px' }}>
                  {item.title}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4' }}>
                  {item.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
