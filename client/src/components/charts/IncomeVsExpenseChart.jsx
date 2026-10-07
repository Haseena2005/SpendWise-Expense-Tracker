import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import { ChartCard, ChartLoading, ChartEmpty, ChartTooltip, CHART_COLORS } from './ChartUtils';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';
import api from '../../services/api';

export default function IncomeVsExpenseChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [months, setMonths] = useState(6);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months + 1);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);

      const params = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      const res = await api.get(`/analytics/income-vs-expense?${params}`);
      setData(res.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [months]);

  const controls = (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Last</span>
      {[3, 6, 12].map(m => (
        <button
          key={m}
          onClick={() => setMonths(m)}
          className={`btn btn-sm ${months === m ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '4px 10px', fontSize: '12px' }}
        >
          {m}M
        </button>
      ))}
    </div>
  );

  return (
    <ChartCard
      title="Income vs Expense"
      subtitle="Side-by-side monthly comparison"
      controls={controls}
    >
      {loading ? (
        <ChartLoading height={300} />
      ) : error ? (
        <ChartEmpty icon="⚠️" message={error} hint="Check server connection" />
      ) : data.length === 0 ? (
        <ChartEmpty message="No transaction data found" hint="Add some transactions to see trends" />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} barCategoryGap="30%" barGap={4}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.income} stopOpacity={0.9} />
                <stop offset="100%" stopColor={CHART_COLORS.income} stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.expense} stopOpacity={0.9} />
                <stop offset="100%" stopColor={CHART_COLORS.expense} stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => formatCompactCurrency(v)}
              tick={{ fill: '#64748b', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={65}
            />
            <Tooltip
              content={<ChartTooltip formatter={formatCurrency} />}
              cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
              formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
            />
            <Bar dataKey="income" name="Income" fill="url(#incomeGrad)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="expense" name="Expense" fill="url(#expenseGrad)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
