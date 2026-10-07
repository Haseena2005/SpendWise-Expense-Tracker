import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ChartCard, ChartLoading, ChartEmpty, ChartTooltip, YearSelector, CHART_COLORS } from './ChartUtils';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';
import api from '../../services/api';

// Compact month names for x-axis
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function MonthlyTrendChart() {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/analytics/yearly?year=${year}`);
      const d = res.data.data;
      // Map monthlyBreakdown for chart — use short month names
      const chartData = (d.monthlyBreakdown || []).map(m => ({
        month: MONTH_SHORT[m.monthNumber - 1],
        income: m.income,
        expense: m.expense,
        balance: m.balance,
      }));
      setData(chartData);
      setSummary({
        annualIncome: d.annualIncome,
        annualExpenses: d.annualExpenses,
        annualBalance: d.annualBalance,
        highestSpendingMonth: d.highestSpendingMonth,
        lowestSpendingMonth: d.lowestSpendingMonth,
      });
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [year]);

  const hasData = data.some(d => d.income > 0 || d.expense > 0);

  return (
    <ChartCard
      title="Monthly Expense Trend"
      subtitle={`Full year breakdown for ${year}`}
      controls={<YearSelector year={year} onChange={setYear} />}
    >
      {loading ? (
        <ChartLoading height={280} />
      ) : error ? (
        <ChartEmpty icon="⚠️" message={error} hint="Check server connection" />
      ) : !hasData ? (
        <ChartEmpty message={`No transactions found for ${year}`} hint="Try selecting a different year" />
      ) : (
        <>
          {/* Mini stat row */}
          {summary && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {[
                { label: 'Annual Income', value: summary.annualIncome, color: CHART_COLORS.income },
                { label: 'Annual Expenses', value: summary.annualExpenses, color: CHART_COLORS.expense },
                { label: 'Net Balance', value: summary.annualBalance, color: CHART_COLORS.indigo },
              ].map(item => (
                <div key={item.label} style={{
                  flex: 1, minWidth: '120px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  borderLeft: `3px solid ${item.color}`,
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: item.color }}>
                    {formatCurrency(item.value)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
              <defs>
                <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.income} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={CHART_COLORS.income} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.expense} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={CHART_COLORS.expense} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={v => formatCompactCurrency(v)}
                tick={{ fill: '#64748b', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={65}
              />
              <Tooltip content={<ChartTooltip formatter={formatCurrency} />} />
              <Area
                type="monotone" dataKey="income" name="Income"
                stroke={CHART_COLORS.income} strokeWidth={2}
                fill="url(#incomeArea)" dot={{ fill: CHART_COLORS.income, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
              <Area
                type="monotone" dataKey="expense" name="Expense"
                stroke={CHART_COLORS.expense} strokeWidth={2}
                fill="url(#expenseArea)" dot={{ fill: CHART_COLORS.expense, r: 3 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {summary?.highestSpendingMonth && (
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                📈 Peak spending: <strong style={{ color: CHART_COLORS.expense }}>{summary.highestSpendingMonth.month}</strong>
                {' '}({formatCurrency(summary.highestSpendingMonth.amount)})
              </span>
            </div>
          )}
        </>
      )}
    </ChartCard>
  );
}
