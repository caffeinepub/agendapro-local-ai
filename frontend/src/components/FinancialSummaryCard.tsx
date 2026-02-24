import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import { FinancialType } from '../backend';
import type { FinancialRecord } from '../backend';

interface FinancialSummaryCardProps {
  records: FinancialRecord[];
}

export function FinancialSummaryCard({ records }: FinancialSummaryCardProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthRecords = records.filter(r => {
    const d = new Date(Number(r.date) / 1_000_000);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = monthRecords
    .filter(r => r.financialType === FinancialType.income)
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = monthRecords
    .filter(r => r.financialType === FinancialType.expense)
    .reduce((sum, r) => sum + r.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card className="border-border shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Receitas</p>
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-green-600 dark:text-green-400">
            {formatCurrency(totalIncome)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">{monthName}</p>
        </CardContent>
      </Card>

      <Card className="border-border shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Despesas</p>
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-2xl font-bold font-display text-red-600 dark:text-red-400">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">{monthName}</p>
        </CardContent>
      </Card>

      <Card className={cn('border-border shadow-card', netBalance >= 0 ? 'ring-1 ring-green-200 dark:ring-green-900' : 'ring-1 ring-red-200 dark:ring-red-900')}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-muted-foreground">Saldo Líquido</p>
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              netBalance >= 0 ? 'bg-primary/10' : 'bg-red-100 dark:bg-red-900/30'
            )}>
              <DollarSign className={cn('w-4 h-4', netBalance >= 0 ? 'text-primary' : 'text-red-600 dark:text-red-400')} />
            </div>
          </div>
          <p className={cn(
            'text-2xl font-bold font-display',
            netBalance >= 0 ? 'text-primary' : 'text-red-600 dark:text-red-400'
          )}>
            {formatCurrency(netBalance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">{monthName}</p>
        </CardContent>
      </Card>
    </div>
  );
}
