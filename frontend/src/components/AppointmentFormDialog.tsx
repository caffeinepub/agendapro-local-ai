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
import { useCreateAppointment } from '@/hooks/useQueries';
import { useGetAllClients } from '@/hooks/useQueries';
import { dateToNanos } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDateTime?: Date;
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  defaultDateTime,
}: AppointmentFormDialogProps) {
  const { data: clients = [] } = useGetAllClients();
  const createAppointment = useCreateAppointment();

  const [clientId, setClientId] = useState('');
  const [service, setService] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (defaultDateTime) {
        const local = new Date(defaultDateTime.getTime() - defaultDateTime.getTimezoneOffset() * 60000);
        setDateTime(local.toISOString().slice(0, 16));
      } else {
        setDateTime('');
      }
      setClientId('');
      setService('');
      setDuration('60');
      setNotes('');
      setErrors({});
    }
  }, [open, defaultDateTime]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!clientId) newErrors.clientId = 'Selecione um cliente';
    if (!service.trim()) newErrors.service = 'Informe o serviço';
    if (!dateTime) newErrors.dateTime = 'Informe a data e hora';
    if (!duration || Number(duration) <= 0) newErrors.duration = 'Duração inválida';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dt = new Date(dateTime);
    await createAppointment.mutateAsync({
      clientId: BigInt(clientId),
      service: service.trim(),
      dateTime: dateToNanos(dt),
      duration: BigInt(Number(duration)),
      notes: notes.trim(),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Novo Agendamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Cliente *</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className={errors.clientId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={String(c.id)} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clientId && <p className="text-xs text-destructive">{errors.clientId}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Serviço *</Label>
            <Input
              value={service}
              onChange={e => setService(e.target.value)}
              placeholder="Ex: Corte de cabelo"
              className={errors.service ? 'border-destructive' : ''}
            />
            {errors.service && <p className="text-xs text-destructive">{errors.service}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Data e Hora *</Label>
              <Input
                type="datetime-local"
                value={dateTime}
                onChange={e => setDateTime(e.target.value)}
                className={errors.dateTime ? 'border-destructive' : ''}
              />
              {errors.dateTime && <p className="text-xs text-destructive">{errors.dateTime}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Duração (min) *</Label>
              <Input
                type="number"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                min="15"
                step="15"
                className={errors.duration ? 'border-destructive' : ''}
              />
              {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observações opcionais..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createAppointment.isPending}>
              {createAppointment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
