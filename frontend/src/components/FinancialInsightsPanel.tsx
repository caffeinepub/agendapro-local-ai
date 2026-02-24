import { useMemo } from 'react';
import { TrendingUp, BarChart2, Lightbulb, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { FinancialRecord } from '../backend';
import { FinancialType } from '../backend';

interface FinancialInsightsPanelProps {
  records: FinancialRecord[];
}

interface CategoryStat {
  category: string;
  count: number;
  total: number;
}

export function FinancialInsightsPanel({ records }: FinancialInsightsPanelProps) {
  const incomeRecords = useMemo(
    () => records.filter(r => r.financialType === FinancialType.income),
    [records]
  );

  const totalRevenue = useMemo(
    () => incomeRecords.reduce((sum, r) => sum + r.amount, 0),
    [incomeRecords]
  );

  const avgTicket = useMemo(
    () => (incomeRecords.length > 0 ? totalRevenue / incomeRecords.length : 0),
    [totalRevenue, incomeRecords]
  );

  const topCategories = useMemo((): CategoryStat[] => {
    const map: Record<string, CategoryStat> = {};
    for (const r of incomeRecords) {
      const cat = r.category || 'Sem categoria';
      if (!map[cat]) {
        map[cat] = { category: cat, count: 0, total: 0 };
      }
      map[cat].count += 1;
      map[cat].total += r.amount;
    }
    return Object.values(map)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [incomeRecords]);

  const topCategory = topCategories[0];

  if (incomeRecords.length === 0) {
    return null;
  }

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          💡 Insights Financeiros
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Summary Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="px-4 py-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Faturamento Total</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="px-4 py-3 rounded-xl bg-green-500/5 border border-green-500/10">
            <div className="flex items-center gap-1.5 mb-1">
              <BarChart2 className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs text-muted-foreground font-medium">Ticket Médio</span>
            </div>
            <p className="text-lg font-bold text-foreground">{formatCurrency(avgTicket)}</p>
          </div>
        </div>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Top Serviços por Volume
            </p>
            <div className="space-y-2">
              {topCategories.map((cat, idx) => (
                <div
                  key={cat.category}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40 text-sm"
                >
                  <span className="text-xs font-bold text-muted-foreground w-5 shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="font-medium text-foreground flex-1 truncate">{cat.category}</span>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {cat.count}x
                  </Badge>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatCurrency(cat.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auto-generated Insight */}
        {topCategory && (
          <div className="flex items-start gap-2 px-3 py-3 rounded-xl bg-amber-50/50 border border-amber-100">
            <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <span className="font-semibold">"{topCategory.category}"</span> é o serviço mais lucrativo com{' '}
              <span className="font-semibold">{topCategory.count} transações</span> e{' '}
              <span className="font-semibold">{formatCurrency(topCategory.total)}</span> em receita.
              Considere promover este serviço para aumentar o faturamento.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
