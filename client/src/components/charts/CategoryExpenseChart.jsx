import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ChartCard, ChartLoading, ChartEmpty, ChartTooltip, formatCurrency, PIE_PALETTE } from './ChartUtils';
import api from '../../services/api';

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  if (percentage < 5) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={12} fontWeight={600}>
      {`${percentage.toFixed(1)}%`}
    </text>
  );
};

export default function CategoryExpenseChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/category-expenses');
      setData(res.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const chartData = data.map(d => ({
    name: d.name,
    value: d.totalAmount,
    count: d.count,
    percentage: d.percentage,
    color: d.color,
  }));

  return (
    <ChartCard
      title="Expense by Category"
      subtitle="Breakdown of where your money goes"
    >
      {loading ? (
        <ChartLoading height={300} />
      ) : error ? (
        <ChartEmpty icon="⚠️" message={error} hint="Check server connection" />
      ) : chartData.length === 0 ? (
        <ChartEmpty message="No expense data found" hint="Add expense transactions to see breakdown" />
      ) : (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 260px', minWidth: 220 }}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={115}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                  onMouseEnter={(_, idx) => setActive(idx)}
                  onMouseLeave={() => setActive(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || PIE_PALETTE[index % PIE_PALETTE.length]}
                      opacity={active === null || active === index ? 1 : 0.5}
                      style={{ cursor: 'pointer', filter: active === index ? 'brightness(1.15)' : 'none' }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<ChartTooltip
                    formatter={(value, name) => `${formatCurrency(value)}`}
                  />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend with detail */}
          <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {chartData.slice(0, 8).map((d, i) => (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
              >
                <span style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: d.color || PIE_PALETTE[i % PIE_PALETTE.length]
                }} />
                <span style={{ fontSize: '13px', color: active === i ? '#f8fafc' : 'var(--text-secondary)', flex: 1 }}>
                  {d.name}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatCurrency(d.value)}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '38px', textAlign: 'right' }}>
                  {d.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  );
}
