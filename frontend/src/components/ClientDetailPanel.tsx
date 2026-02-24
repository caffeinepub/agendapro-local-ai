import { useState } from 'react';
import {
  Phone,
  Mail,
  Calendar,
  Edit2,
  Trash2,
  MessageSquare,
  Star,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { cn, formatDate, formatDateTime, nanosToMs, getBusinessTypeLabel, daysSince } from '@/lib/utils';
import { useDeleteClient } from '@/hooks/useQueries';
import { AppointmentStatus } from '../backend';
import type { Client, Appointment } from '../backend';

interface ClientDetailPanelProps {
  client: Client;
  appointments: Appointment[];
  onEdit: () => void;
  onClose: () => void;
  onGenerateMessage: () => void;
}

export function ClientDetailPanel({
  client,
  appointments,
  onEdit,
  onClose,
  onGenerateMessage,
}: ClientDetailPanelProps) {
  const deleteClient = useDeleteClient();

  const clientAppointments = appointments
    .filter(a => a.clientId === client.id)
    .sort((a, b) => Number(b.dateTime - a.dateTime));

  const handleDelete = async () => {
    await deleteClient.mutateAsync(client.id);
    onClose();
  };

  const days = daysSince(client.lastVisit);

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-sm">
              {client.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">{client.name}</h3>
            <Badge variant="outline" className="text-xs mt-0.5">
              {getBusinessTypeLabel(client.businessType as string)}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold font-display text-primary">
                {Number(client.totalVisits)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Total de visitas</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className={cn(
                'text-2xl font-bold font-display',
                days > 30 ? 'text-destructive' : days > 14 ? 'text-yellow-600' : 'text-green-600'
              )}>
                {days}d
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Desde última visita</p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contato</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Última visita: {formatDate(client.lastVisit)}</span>
              </div>
            </div>
          </div>

          {client.notes && (
            <>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Observações</p>
                <p className="text-sm text-foreground/80 bg-muted/30 rounded-lg p-2.5">{client.notes}</p>
              </div>
            </>
          )}

          {/* Appointment History */}
          <Separator />
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Histórico ({clientAppointments.length})
            </p>
            {clientAppointments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">Nenhum agendamento registrado</p>
            ) : (
              <div className="space-y-2">
                {clientAppointments.slice(0, 10).map(appt => (
                  <div key={String(appt.id)} className="flex items-start justify-between bg-muted/30 rounded-lg p-2.5">
                    <div>
                      <p className="text-xs font-medium">{appt.service}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(appt.dateTime)}
                      </p>
                    </div>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded font-medium',
                      appt.status === AppointmentStatus.completed && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                      appt.status === AppointmentStatus.scheduled && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                      appt.status === AppointmentStatus.cancelled && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                    )}>
                      {appt.status === AppointmentStatus.completed ? 'Concluído' :
                        appt.status === AppointmentStatus.scheduled ? 'Agendado' : 'Cancelado'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <Button className="w-full" size="sm" onClick={onGenerateMessage}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Gerar Mensagem
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
            Editar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O cliente "{client.name}" será removido permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
