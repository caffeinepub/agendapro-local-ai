import { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AppointmentCalendar } from '@/components/AppointmentCalendar';
import { AppointmentFormDialog } from '@/components/AppointmentFormDialog';
import { AgendaInsightsPanel } from '@/components/AgendaInsightsPanel';
import { useGetAllAppointments, useGetAllClients } from '@/hooks/useQueries';
import { AppointmentStatus } from '../backend';

export function AgendaPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>();

  const { data: appointments = [], isLoading: loadingAppts } = useGetAllAppointments();
  const { data: clients = [], isLoading: loadingClients } = useGetAllClients();

  const handleNewAppointment = (dateTime: Date) => {
    setSelectedDateTime(dateTime);
    setFormOpen(true);
  };

  const isLoading = loadingAppts || loadingClients;

  return (
    <div className="flex flex-col h-full p-4 lg:p-6 gap-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">Agenda</h1>
            <p className="text-xs text-muted-foreground">
              {appointments.filter(a => a.status === AppointmentStatus.scheduled).length} agendamentos ativos
            </p>
          </div>
        </div>
        <Button onClick={() => { setSelectedDateTime(new Date()); setFormOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {isLoading ? (
        <div className="flex-1 space-y-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-[500px] w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-4 flex-1 min-h-0">
          {/* Calendar */}
          <div className="flex-1 min-h-0">
            <AppointmentCalendar
              appointments={appointments}
              clients={clients}
              onNewAppointment={handleNewAppointment}
            />
          </div>

          {/* Insights Panel */}
          <div className="xl:w-80 shrink-0">
            <AgendaInsightsPanel appointments={appointments} clients={clients} />
          </div>
        </div>
      )}

      <AppointmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultDateTime={selectedDateTime}
      />
    </div>
  );
}
