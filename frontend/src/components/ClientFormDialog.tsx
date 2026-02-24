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
import { useCreateClient, useUpdateClient } from '@/hooks/useQueries';
import { BusinessType } from '../backend';
import type { Client } from '../backend';
import { Loader2 } from 'lucide-react';

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editClient?: Client | null;
}

const businessTypeOptions = [
  { value: BusinessType.barber, label: 'Barbearia' },
  { value: BusinessType.petshop, label: 'Pet Shop' },
  { value: BusinessType.salon, label: 'Salão' },
  { value: BusinessType.clinic, label: 'Clínica' },
];

export function ClientFormDialog({ open, onOpenChange, editClient }: ClientFormDialogProps) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>(BusinessType.barber);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (editClient) {
        setName(editClient.name);
        setPhone(editClient.phone);
        setEmail(editClient.email);
        setBusinessType(editClient.businessType as BusinessType);
        setNotes(editClient.notes);
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setBusinessType(BusinessType.barber);
        setNotes('');
      }
      setErrors({});
    }
  }, [open, editClient]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email inválido';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editClient) {
      await updateClient.mutateAsync({
        id: editClient.id,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        businessType,
        notes: notes.trim(),
      });
    } else {
      await createClient.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        businessType,
      });
    }
    onOpenChange(false);
  };

  const isPending = createClient.isPending || updateClient.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editClient ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome completo"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Telefone *</Label>
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de Negócio</Label>
              <Select value={businessType} onValueChange={v => setBusinessType(v as BusinessType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessTypeOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          {editClient && (
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Notas sobre o cliente..."
                rows={2}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editClient ? 'Salvar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
