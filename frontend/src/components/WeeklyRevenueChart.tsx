import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FinancialType } from '../backend';
import type { FinancialRecord } from '../backend';

interface WeeklyRevenueChartProps {
  records: FinancialRecord[];
}

export function WeeklyRevenueChart({ records }: WeeklyRevenueChartProps) {
  const data = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthRecords = records.filter(r => {
      const d = new Date(Number(r.date) / 1_000_000);
      return d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear &&
        r.financialType === FinancialType.income;
    });

    const weeks: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    monthRecords.forEach(r => {
      const d = new Date(Number(r.date) / 1_000_000);
      const week = Math.ceil(d.getDate() / 7);
      weeks[week] = (weeks[week] || 0) + r.amount;
    });

    return Object.entries(weeks)
      .filter(([, v]) => v > 0 || true)
      .map(([week, amount]) => ({
        name: `Sem. ${week}`,
        receita: Number(amount.toFixed(2)),
      }))
      .slice(0, 5);
  }, [records]);

  const formatBRL = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

  return (
    <Card className="border-border shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-display text-base">Receita Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.015 60)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: 'oklch(0.52 0.02 55)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => `R$${v}`}
              tick={{ fontSize: 10, fill: 'oklch(0.52 0.02 55)' }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip
              formatter={(value: number) => [formatBRL(value), 'Receita']}
              contentStyle={{
                background: 'oklch(1 0 0)',
                border: '1px solid oklch(0.88 0.015 60)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="receita" fill="oklch(0.72 0.18 55)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
