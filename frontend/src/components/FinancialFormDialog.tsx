import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateFinancialRecord } from '@/hooks/useQueries';
import { FinancialType } from '../backend';
import { dateToNanos } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface FinancialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const incomeCategories = ['Serviço', 'Produto', 'Consulta', 'Pacote', 'Outro'];
const expenseCategories = ['Aluguel', 'Salário', 'Material', 'Equipamento', 'Marketing', 'Utilidades', 'Outro'];

export function FinancialFormDialog({ open, onOpenChange }: FinancialFormDialogProps) {
  const createRecord = useCreateFinancialRecord();

  const [financialType, setFinancialType] = useState<FinancialType>(FinancialType.income);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setFinancialType(FinancialType.income);
      setAmount('');
      setCategory('');
      const today = new Date();
      const local = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
      setDate(local.toISOString().slice(0, 10));
      setDescription('');
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!amount || Number(amount) <= 0) newErrors.amount = 'Valor inválido';
    if (!category) newErrors.category = 'Selecione uma categoria';
    if (!date) newErrors.date = 'Informe a data';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await createRecord.mutateAsync({
      financialType,
      amount: Number(amount),
      category,
      date: dateToNanos(new Date(date + 'T12:00:00')),
      description: description.trim(),
      linkedAppointmentId: null,
    });
    onOpenChange(false);
  };

  const categories = financialType === FinancialType.income ? incomeCategories : expenseCategories;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Novo Registro Financeiro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tipo *</Label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => { setFinancialType(FinancialType.income); setCategory(''); }}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${financialType === FinancialType.income ? 'bg-green-600 text-white' : 'hover:bg-muted'}`}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => { setFinancialType(FinancialType.expense); setCategory(''); }}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${financialType === FinancialType.expense ? 'bg-red-600 text-white' : 'hover:bg-muted'}`}
              >
                Despesa
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0,00"
                min="0.01"
                step="0.01"
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Data *</Label>
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Categoria *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descrição opcional..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createRecord.isPending}>
              {createRecord.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
