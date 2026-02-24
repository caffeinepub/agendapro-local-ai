import { useState } from 'react';
import { Bell, Copy, Check, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useReminders } from '@/hooks/useQueries';
import { formatDateTime } from '@/lib/utils';
import type { Reminder } from '../backend';

function ReminderCard({ reminder }: { reminder: Reminder }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reminder.message);
      setCopied(true);
      toast.success('Mensagem copiada!', {
        description: `Lembrete para ${reminder.clientName} copiado para a área de transferência.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar', { description: 'Não foi possível copiar a mensagem.' });
    }
  };

  return (
    <Card className="border border-border bg-card hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-semibold text-sm text-foreground truncate">
                {reminder.clientName}
              </span>
              <Badge variant="outline" className="text-xs shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDateTime(reminder.appointmentTime)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {reminder.message}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="shrink-0 gap-1.5"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? 'Copiado' : 'Copiar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReminderGroupSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-40 rounded-lg" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function RemindersPage() {
  const { data: reminders = [], isLoading } = useReminders();

  const reminders24h = reminders.filter(r => r.reminderType === '24h');
  const reminders2h = reminders.filter(r => r.reminderType === '2h');

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">Lembretes Automáticos</h1>
          <p className="text-xs text-muted-foreground">
            {isLoading ? 'Carregando...' : `${reminders.length} lembretes gerados para agendamentos futuros`}
          </p>
        </div>
      </div>

      {/* Status Banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary/5 border border-primary/20 text-sm">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
        <span className="text-foreground font-medium">status:</span>
        <span className="text-muted-foreground">sucesso</span>
        <span className="mx-1 text-border">·</span>
        <span className="text-foreground font-medium">módulo:</span>
        <span className="text-muted-foreground">lembretes</span>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <ReminderGroupSkeleton />
          <ReminderGroupSkeleton />
        </div>
      ) : reminders.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <Bell className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm font-medium">Nenhum agendamento futuro encontrado</p>
            <p className="text-muted-foreground/60 text-xs text-center max-w-xs">
              Os lembretes são gerados automaticamente para agendamentos com status "agendado" no futuro.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* 24h Reminders */}
          <section>
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  Lembretes — 24h Antes
                  <Badge className="ml-auto bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/20">
                    {reminders24h.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {reminders24h.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Nenhum lembrete de 24h disponível.
                  </p>
                ) : (
                  reminders24h.map((reminder, idx) => (
                    <ReminderCard key={`24h-${idx}`} reminder={reminder} />
                  ))
                )}
              </CardContent>
            </Card>
          </section>

          {/* 2h Reminders */}
          <section>
            <Card className="border border-border">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  Lembretes — 2h Antes
                  <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    {reminders2h.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {reminders2h.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    Nenhum lembrete de 2h disponível.
                  </p>
                ) : (
                  reminders2h.map((reminder, idx) => (
                    <ReminderCard key={`2h-${idx}`} reminder={reminder} />
                  ))
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      )}

      {/* Insights Panel */}
      <Card className="border border-border bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            💡 Insights & Ações Recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm">Reduza faltas com lembretes</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              Enviar lembretes 24h e 2h antes do agendamento reduz significativamente as faltas e cancelamentos de última hora.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-2 text-sm">
              <span className="text-primary font-bold mt-0.5">→</span>
              <span className="text-muted-foreground">Envie via WhatsApp imediatamente para clientes com agendamentos próximos.</span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-primary font-bold mt-0.5">→</span>
              <span className="text-muted-foreground">Use o botão "Copiar" para copiar a mensagem e colar diretamente no WhatsApp.</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
