import { useState } from 'react';
import { Trash2, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn, formatDate, formatCurrency, nanosToMs } from '@/lib/utils';
import { useDeleteFinancialRecord } from '@/hooks/useQueries';
import { FinancialType } from '../backend';
import type { FinancialRecord } from '../backend';

interface TransactionListProps {
  records: FinancialRecord[];
}

type FilterType = 'all' | 'income' | 'expense';

export function TransactionList({ records }: TransactionListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const deleteRecord = useDeleteFinancialRecord();

  const filtered = records
    .filter(r => {
      if (filter === 'income') return r.financialType === FinancialType.income;
      if (filter === 'expense') return r.financialType === FinancialType.expense;
      return true;
    })
    .sort((a, b) => Number(b.date - a.date));

  return (
    <div className="space-y-3">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(['all', 'income', 'expense'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                filter === f ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              {f === 'all' ? 'Todos' : f === 'income' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} registros</span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground text-sm">
          Nenhum registro encontrado
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-xs">Tipo</TableHead>
                <TableHead className="text-xs">Descrição</TableHead>
                <TableHead className="text-xs">Categoria</TableHead>
                <TableHead className="text-xs">Data</TableHead>
                <TableHead className="text-xs text-right">Valor</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(record => (
                <TableRow key={String(record.id)} className="hover:bg-muted/20">
                  <TableCell>
                    <div className={cn(
                      'flex items-center gap-1.5 text-xs font-medium',
                      record.financialType === FinancialType.income ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    )}>
                      {record.financialType === FinancialType.income
                        ? <TrendingUp className="w-3.5 h-3.5" />
                        : <TrendingDown className="w-3.5 h-3.5" />
                      }
                      {record.financialType === FinancialType.income ? 'Receita' : 'Despesa'}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm max-w-[160px] truncate">{record.description || '—'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{record.category}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(record.date)}</TableCell>
                  <TableCell className={cn(
                    'text-right font-semibold text-sm',
                    record.financialType === FinancialType.income ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}>
                    {record.financialType === FinancialType.income ? '+' : '-'}{formatCurrency(record.amount)}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteRecord.mutate(record.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
