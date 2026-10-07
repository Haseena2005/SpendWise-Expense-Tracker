import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer
} from 'recharts';
import { ChartCard, ChartLoading, ChartEmpty, ChartTooltip, YearSelector, MonthSelector, CHART_COLORS } from './ChartUtils';
import { formatCurrency, formatCompactCurrency } from '../../utils/formatters';
import api from '../../services/api';

export default function YearlyTrendChart() {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [yearlyData, setYearlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [monthlyRes, yearlyRes] = await Promise.all([
        api.get(`/analytics/monthly?year=${year}&month=${month}`),
        api.get(`/analytics/yearly?year=${year}`),
      ]);

      setMonthlyStats(monthlyRes.data.data);

      const y = yearlyRes.data.data;
      const breakdown = (y.monthlyBreakdown || []).map(m => ({
        month: m.month.substring(0, 3),
        net: m.balance,
        income: m.income,
        expense: m.expense,
      }));
      setYearlyData(breakdown);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [year, month]);

  const hasData = yearlyData.some(d => d.income > 0 || d.expense > 0);

  const stats = monthlyStats
    ? [
        { label: 'Monthly Income', value: monthlyStats.income, color: CHART_COLORS.income, icon: '↑' },
        { label: 'Monthly Expenses', value: monthlyStats.expenses, color: CHART_COLORS.expense, icon: '↓' },
        { label: 'Net Balance', value: monthlyStats.balance, color: CHART_COLORS.indigo, icon: '⚖' },
        { label: 'Transactions', value: monthlyStats.transactionCount, color: CHART_COLORS.purple, icon: '#', isCurrency: false },
        { label: 'Highest Expense', value: monthlyStats.highestExpense, color: CHART_COLORS.amber, icon: '⬆' },
        { label: 'Avg Expense', value: monthlyStats.averageExpense, color: CHART_COLORS.cyan, icon: '≈' },
      ]
    : [];

  return (
    <ChartCard
      title="Yearly Financial Trend"
      subtitle="Net balance per month + monthly deep-dive"
      controls={
        <div style={{ display: 'flex', gap: '8px' }}>
          <MonthSelector month={month} onChange={setMonth} />
          <YearSelector year={year} onChange={setYear} />
        </div>
      }
    >
      {loading ? (
        <ChartLoading height={340} />
      ) : error ? (
        <ChartEmpty icon="⚠️" message={error} hint="Check server connection" />
      ) : (
        <>
          {/* Monthly stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
            marginBottom: '24px'
          }}>
            {stats.map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                borderTop: `2px solid ${s.color}`,
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: s.color, marginBottom: '4px' }}>
                  {s.isCurrency === false ? s.value : formatCurrency(s.value)}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Yearly net balance bar chart */}
          {!hasData ? (
            <ChartEmpty message={`No transactions for ${year}`} hint="Try a different year" />
          ) : (
            <>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {year} — Monthly Net Balance
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={yearlyData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={v => formatCompactCurrency(v)}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={65}
                  />
                  <Tooltip content={<ChartTooltip formatter={formatCurrency} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="net" name="Net Balance" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {yearlyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.net >= 0 ? CHART_COLORS.income : CHART_COLORS.expense}
                        opacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </>
      )}
    </ChartCard>
  );
}
