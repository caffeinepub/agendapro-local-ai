import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatTime, nanosToMs, getStatusClass, getStatusLabel } from '@/lib/utils';
import { useUpdateAppointmentStatus, useDeleteAppointment } from '@/hooks/useQueries';
import { AppointmentStatus } from '../backend';
import type { Appointment, Client } from '../backend';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ViewMode = 'day' | 'week';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  clients: Client[];
  onNewAppointment: (dateTime: Date) => void;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7am to 7pm

function getClientName(clients: Client[], clientId: bigint): string {
  return clients.find(c => c.id === clientId)?.name ?? 'Cliente';
}

function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function AppointmentCalendar({ appointments, clients, onNewAppointment }: AppointmentCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const updateStatus = useUpdateAppointmentStatus();
  const deleteAppointment = useDeleteAppointment();

  const weekDays = getWeekDays(currentDate);

  const navigate = (dir: -1 | 1) => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + dir);
    else d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  };

  const getAppointmentsForDay = (day: Date) =>
    appointments.filter(a => {
      const dt = new Date(nanosToMs(a.dateTime));
      return isSameDay(dt, day);
    });

  const getAppointmentsForHour = (day: Date, hour: number) =>
    getAppointmentsForDay(day).filter(a => {
      const dt = new Date(nanosToMs(a.dateTime));
      return dt.getHours() === hour;
    });

  const handleSlotClick = (day: Date, hour: number) => {
    const dt = new Date(day);
    dt.setHours(hour, 0, 0, 0);
    onNewAppointment(dt);
  };

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const headerLabel = viewMode === 'day'
    ? `${currentDate.getDate()} de ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : `${monthNames[weekDays[0].getMonth()]} ${weekDays[0].getFullYear()}`;

  const displayDays = viewMode === 'day' ? [currentDate] : weekDays;

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-display font-semibold text-sm min-w-[180px] text-center">
            {headerLabel}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="ml-1 text-xs"
          >
            Hoje
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('day')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'day' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                viewMode === 'week' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              Semana
            </button>
          </div>
          <Button size="sm" onClick={() => onNewAppointment(currentDate)}>
            <Plus className="w-4 h-4 mr-1" />
            Novo
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className={cn('grid border-b border-border', viewMode === 'week' ? 'grid-cols-[60px_repeat(7,1fr)]' : 'grid-cols-[60px_1fr]')}>
        <div className="py-2" />
        {displayDays.map((day, i) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div key={i} className="py-2 text-center border-l border-border">
              <p className="text-xs text-muted-foreground">{dayNames[day.getDay()]}</p>
              <p className={cn(
                'text-sm font-semibold mt-0.5 w-7 h-7 rounded-full flex items-center justify-center mx-auto',
                isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'
              )}>
                {day.getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className={cn('grid', viewMode === 'week' ? 'grid-cols-[60px_repeat(7,1fr)]' : 'grid-cols-[60px_1fr]')}>
          {HOURS.map(hour => (
            <>
              <div key={`hour-${hour}`} className="py-3 pr-2 text-right text-xs text-muted-foreground border-b border-border/50">
                {hour}:00
              </div>
              {displayDays.map((day, di) => {
                const slotAppts = getAppointmentsForHour(day, hour);
                return (
                  <div
                    key={`${di}-${hour}`}
                    className="border-l border-b border-border/50 min-h-[56px] p-1 cursor-pointer hover:bg-muted/30 transition-colors relative group"
                    onClick={() => handleSlotClick(day, hour)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <Plus className="w-3 h-3 text-muted-foreground/50" />
                    </div>
                    {slotAppts.map(appt => (
                      <AppointmentChip
                        key={String(appt.id)}
                        appointment={appt}
                        clientName={getClientName(clients, appt.clientId)}
                        onComplete={() => updateStatus.mutate({ id: appt.id, status: AppointmentStatus.completed })}
                        onCancel={() => updateStatus.mutate({ id: appt.id, status: AppointmentStatus.cancelled })}
                        onDelete={() => deleteAppointment.mutate(appt.id)}
                      />
                    ))}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}

interface AppointmentChipProps {
  appointment: Appointment;
  clientName: string;
  onComplete: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

function AppointmentChip({ appointment, clientName, onComplete, onCancel, onDelete }: AppointmentChipProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            'text-xs rounded px-1.5 py-1 mb-0.5 cursor-pointer truncate font-medium border',
            appointment.status === AppointmentStatus.scheduled && 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
            appointment.status === AppointmentStatus.completed && 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
            appointment.status === AppointmentStatus.cancelled && 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800 line-through opacity-60',
          )}
          onClick={e => e.stopPropagation()}
        >
          <span className="font-semibold">{formatTime(appointment.dateTime)}</span>
          {' '}{clientName} · {appointment.service}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <div className="px-2 py-1.5">
          <p className="text-xs font-semibold truncate">{clientName}</p>
          <p className="text-xs text-muted-foreground truncate">{appointment.service}</p>
          <Badge className={cn('mt-1 text-xs', getStatusClass(appointment.status))} variant="outline">
            {getStatusLabel(appointment.status)}
          </Badge>
        </div>
        <DropdownMenuSeparator />
        {appointment.status === AppointmentStatus.scheduled && (
          <>
            <DropdownMenuItem onClick={onComplete}>
              <Check className="w-3.5 h-3.5 mr-2 text-green-600" />
              Concluir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCancel}>
              <XIcon className="w-3.5 h-3.5 mr-2 text-red-600" />
              Cancelar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
