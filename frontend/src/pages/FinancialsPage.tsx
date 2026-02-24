import { useState } from 'react';
import { DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FinancialSummaryCard } from '@/components/FinancialSummaryCard';
import { WeeklyRevenueChart } from '@/components/WeeklyRevenueChart';
import { TransactionList } from '@/components/TransactionList';
import { FinancialFormDialog } from '@/components/FinancialFormDialog';
import { FinancialInsightsPanel } from '@/components/FinancialInsightsPanel';
import { useGetAllFinancialRecords } from '@/hooks/useQueries';

export function FinancialsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const { data: records = [], isLoading } = useGetAllFinancialRecords();

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">Financeiro</h1>
            <p className="text-xs text-muted-foreground">{records.length} registros totais</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Novo Registro
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <FinancialSummaryCard records={records} />

          {/* Financial Insights Panel */}
          <FinancialInsightsPanel records={records} />

          {/* Chart + Transactions */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1">
              <WeeklyRevenueChart records={records} />
            </div>
            <div className="xl:col-span-2">
              <div className="bg-card rounded-xl border border-border p-4">
                <h2 className="font-display font-semibold text-base mb-4">Transações</h2>
                <TransactionList records={records} />
              </div>
            </div>
          </div>
        </>
      )}

      <FinancialFormDialog open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
