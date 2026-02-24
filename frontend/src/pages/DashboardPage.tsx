import { Link } from '@tanstack/react-router';
import { Calendar, Users, DollarSign, TrendingUp, ArrowRight, Zap, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useGetAllClients, useGetAllAppointments, useGetAllFinancialRecords } from '@/hooks/useQueries';
import { formatCurrency, formatDateTime, nanosToMs, getStatusClass, getStatusLabel } from '@/lib/utils';
import { AppointmentStatus, FinancialType } from '../backend';
import type { Client } from '../backend';

export function DashboardPage() {
  const { data: clients = [], isLoading: loadingClients } = useGetAllClients();
  const { data: appointments = [], isLoading: loadingAppts } = useGetAllAppointments();
  const { data: records = [], isLoading: loadingRecords } = useGetAllFinancialRecords();

  const isLoading = loadingClients || loadingAppts || loadingRecords;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthRecords = records.filter(r => {
    const d = new Date(Number(r.date) / 1_000_000);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalIncome = monthRecords
    .filter(r => r.financialType === FinancialType.income)
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = monthRecords
    .filter(r => r.financialType === FinancialType.expense)
    .reduce((sum, r) => sum + r.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const scheduledToday = appointments.filter(a => {
    const dt = new Date(nanosToMs(a.dateTime));
    return (
      a.status === AppointmentStatus.scheduled &&
      dt.getDate() === now.getDate() &&
      dt.getMonth() === now.getMonth() &&
      dt.getFullYear() === now.getFullYear()
    );
  });

  const upcomingAppointments = appointments
    .filter(a => a.status === AppointmentStatus.scheduled && Number(a.dateTime) / 1_000_000 >= now.getTime())
    .sort((a, b) => Number(a.dateTime - b.dateTime))
    .slice(0, 5);

  const getClientName = (clientId: bigint): string => {
    return clients.find((c: Client) => c.id === clientId)?.name ?? 'Cliente';
  };

  const statsCards = [
    {
      label: 'Clientes',
      value: isLoading ? null : clients.length,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      href: '/clients',
    },
    {
      label: 'Agendamentos Hoje',
      value: isLoading ? null : scheduledToday.length,
      icon: Calendar,
      color: 'text-primary',
      bg: 'bg-primary/10',
      href: '/agenda',
    },
    {
      label: 'Receita do Mês',
      value: isLoading ? null : formatCurrency(totalIncome),
      icon: DollarSign,
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      href: '/financials',
    },
    {
      label: 'Saldo Líquido',
      value: isLoading ? null : formatCurrency(netBalance),
      icon: TrendingUp,
      color: netBalance >= 0 ? 'text-primary' : 'text-destructive',
      bg: netBalance >= 0 ? 'bg-primary/10' : 'bg-destructive/10',
      href: '/financials',
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sidebar to-charcoal-light rounded-2xl p-5 flex items-center justify-between overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">AgendaPro Local AI</span>
          </div>
          <h2 className="font-display font-bold text-xl text-white mb-1">
            Bem-vindo de volta!
          </h2>
          <p className="text-sm text-white/60">
            {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Link to="/agenda">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Ver Agenda
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-10 w-24 h-24 rounded-full bg-white/5" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} to={href}>
            <Card className="border-border shadow-card hover:shadow-card-hover transition-shadow cursor-pointer group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                </div>
                {value === null ? (
                  <Skeleton className="h-7 w-16 mb-1" />
                ) : (
                  <p className={`text-xl font-bold font-display ${color}`}>{value}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-base">Próximos Agendamentos</h3>
              </div>
              <Link to="/agenda">
                <Button variant="ghost" size="sm" className="text-xs h-7">
                  Ver todos
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum agendamento futuro</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingAppointments.map(appt => (
                  <div key={String(appt.id)} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{getClientName(appt.clientId)}</p>
                      <p className="text-xs text-muted-foreground">{appt.service} · {formatDateTime(appt.dateTime)}</p>
                    </div>
                    <Badge className={`text-xs ml-2 flex-shrink-0 ${getStatusClass(appt.status)}`} variant="outline">
                      {getStatusLabel(appt.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-base">Acesso Rápido</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Nova Agenda', icon: Calendar, href: '/agenda', desc: 'Agendar serviço' },
                { label: 'Novo Cliente', icon: Users, href: '/clients', desc: 'Cadastrar cliente' },
                { label: 'Financeiro', icon: DollarSign, href: '/financials', desc: 'Registrar transação' },
                { label: 'Retenção', icon: TrendingUp, href: '/retention', desc: 'Ver insights' },
              ].map(({ label, icon: Icon, href, desc }) => (
                <Link key={label} to={href}>
                  <div className="p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
