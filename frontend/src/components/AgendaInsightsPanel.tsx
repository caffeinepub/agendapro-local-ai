import { useMemo } from 'react';
import { Clock, AlertTriangle, CheckCircle2, Lightbulb, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatTime, nanosToMs } from '@/lib/utils';
import type { Appointment, Client } from '../backend';
import { AppointmentStatus } from '../backend';

interface AgendaInsightsPanelProps {
  appointments: Appointment[];
  clients: Client[];
}

interface FreeSlot {
  start: number;
  end: number;
  durationMinutes: number;
}

interface Conflict {
  a: Appointment;
  b: Appointment;
}

function getClientName(clients: Client[], clientId: bigint): string {
  return clients.find(c => c.id === clientId)?.name ?? 'Cliente';
}

export function AgendaInsightsPanel({ appointments, clients }: AgendaInsightsPanelProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayEnd = useMemo(() => {
    const d = new Date(today);
    d.setHours(23, 59, 59, 999);
    return d;
  }, [today]);

  const todayAppointments = useMemo(() => {
    return appointments
      .filter(a => {
        const ms = nanosToMs(a.dateTime);
        return ms >= today.getTime() && ms <= todayEnd.getTime() && a.status !== AppointmentStatus.cancelled;
      })
      .sort((a, b) => Number(a.dateTime - b.dateTime));
  }, [appointments, today, todayEnd]);

  const freeSlots = useMemo((): FreeSlot[] => {
    if (todayAppointments.length === 0) return [];
    const slots: FreeSlot[] = [];
    const workStart = new Date(today);
    workStart.setHours(8, 0, 0, 0);
    const workEnd = new Date(today);
    workEnd.setHours(20, 0, 0, 0);

    const sorted = [...todayAppointments];
    let cursor = workStart.getTime();

    for (const appt of sorted) {
      const apptStart = nanosToMs(appt.dateTime);
      const apptEnd = apptStart + Number(appt.duration) * 60 * 1000;
      if (apptStart > cursor) {
        const gapMinutes = Math.floor((apptStart - cursor) / 60000);
        if (gapMinutes >= 30) {
          slots.push({ start: cursor, end: apptStart, durationMinutes: gapMinutes });
        }
      }
      cursor = Math.max(cursor, apptEnd);
    }

    if (cursor < workEnd.getTime()) {
      const gapMinutes = Math.floor((workEnd.getTime() - cursor) / 60000);
      if (gapMinutes >= 30) {
        slots.push({ start: cursor, end: workEnd.getTime(), durationMinutes: gapMinutes });
      }
    }

    return slots;
  }, [todayAppointments, today]);

  const conflicts = useMemo((): Conflict[] => {
    const found: Conflict[] = [];
    for (let i = 0; i < todayAppointments.length; i++) {
      for (let j = i + 1; j < todayAppointments.length; j++) {
        const a = todayAppointments[i];
        const b = todayAppointments[j];
        const aStart = nanosToMs(a.dateTime);
        const aEnd = aStart + Number(a.duration) * 60 * 1000;
        const bStart = nanosToMs(b.dateTime);
        if (bStart < aEnd) {
          found.push({ a, b });
        }
      }
    }
    return found;
  }, [todayAppointments]);

  const idleInsights = useMemo(() => {
    return freeSlots
      .filter(s => s.durationMinutes >= 60)
      .map(s => {
        const startStr = new Date(s.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const endStr = new Date(s.end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const hours = Math.floor(s.durationMinutes / 60);
        const mins = s.durationMinutes % 60;
        const duration = mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
        return `Horário ocioso entre ${startStr} e ${endStr} (${duration}) — considere enviar uma promoção.`;
      });
  }, [freeSlots]);

  if (todayAppointments.length === 0 && freeSlots.length === 0 && conflicts.length === 0) {
    return (
      <Card className="border border-border">
        <CardContent className="flex flex-col items-center justify-center py-10 gap-2">
          <CalendarCheck className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nenhum agendamento para hoje.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Today's Appointments */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <CalendarCheck className="w-4 h-4 text-primary" />
            Agendamentos de Hoje
            <Badge variant="secondary" className="ml-auto">{todayAppointments.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {todayAppointments.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum agendamento hoje.</p>
          ) : (
            todayAppointments.map(appt => (
              <div
                key={String(appt.id)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/40 text-sm"
              >
                <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">
                  {formatTime(appt.dateTime)}
                </span>
                <span className="font-medium text-foreground truncate flex-1">
                  {getClientName(clients, appt.clientId)}
                </span>
                <span className="text-muted-foreground text-xs truncate max-w-[100px]">
                  {appt.service}
                </span>
                <Badge
                  variant={appt.status === AppointmentStatus.completed ? 'default' : 'outline'}
                  className="text-xs shrink-0"
                >
                  {appt.status === AppointmentStatus.scheduled ? 'Agendado' :
                   appt.status === AppointmentStatus.completed ? 'Concluído' : 'Cancelado'}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Free Slots */}
      {freeSlots.length > 0 && (
        <Card className="border border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="w-4 h-4 text-green-600" />
              Horários Livres
              <Badge variant="outline" className="ml-auto text-green-700 border-green-200 bg-green-50">
                {freeSlots.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {freeSlots.map((slot, idx) => {
              const startStr = new Date(slot.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const endStr = new Date(slot.end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              const hours = Math.floor(slot.durationMinutes / 60);
              const mins = slot.durationMinutes % 60;
              const duration = mins > 0 ? `${hours > 0 ? hours + 'h' : ''}${mins}min` : `${hours}h`;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-50/50 border border-green-100 text-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  <span className="text-foreground">
                    {startStr} – {endStr}
                  </span>
                  <Badge variant="outline" className="ml-auto text-xs text-green-700 border-green-200">
                    {duration} livre
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Card className="border border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Conflitos Detectados
              <Badge variant="destructive" className="ml-auto">{conflicts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {conflicts.map((conflict, idx) => (
              <Alert key={idx} variant="destructive" className="py-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">
                  <strong>{getClientName(clients, conflict.a.clientId)}</strong> às {formatTime(conflict.a.dateTime)} e{' '}
                  <strong>{getClientName(clients, conflict.b.clientId)}</strong> às {formatTime(conflict.b.dateTime)} se sobrepõem.
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Idle Insights */}
      {idleInsights.length > 0 && (
        <Card className="border border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-700">
              <Lightbulb className="w-4 h-4" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {idleInsights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-amber-800">
                <span className="font-bold mt-0.5 shrink-0">→</span>
                <span>{insight}</span>
              </div>
            ))}
            <div className="flex items-start gap-2 text-xs text-amber-700 mt-1">
              <span className="font-bold mt-0.5 shrink-0">→</span>
              <span>Envie uma promoção para preencher os horários ociosos.</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
