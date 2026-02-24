import { useMemo } from 'react';
import { UserX, Star, Crown, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, daysSince, nanosToMs } from '@/lib/utils';
import type { Client, FinancialRecord } from '../backend';
import { FinancialType } from '../backend';

interface CrmInsightsPanelProps {
  clients: Client[];
  financialRecords: FinancialRecord[];
}

const INACTIVE_DAYS = 30;

export function CrmInsightsPanel({ clients, financialRecords }: CrmInsightsPanelProps) {
  const inactiveClients = useMemo(() => {
    return clients
      .map(c => ({ client: c, daysSinceVisit: daysSince(c.lastVisit) }))
      .filter(({ daysSinceVisit }) => daysSinceVisit > INACTIVE_DAYS)
      .sort((a, b) => b.daysSinceVisit - a.daysSinceVisit)
      .slice(0, 5);
  }, [clients]);

  const frequentClients = useMemo(() => {
    return [...clients]
      .sort((a, b) => Number(b.totalVisits - a.totalVisits))
      .filter(c => Number(c.totalVisits) > 0)
      .slice(0, 5);
  }, [clients]);

  const vipClients = useMemo(() => {
    const incomeRecords = financialRecords.filter(r => r.financialType === FinancialType.income);

    const clientSpend: Record<string, { total: number; count: number; name: string }> = {};

    for (const client of clients) {
      const clientId = String(client.id);
      const linked = incomeRecords.filter(r => r.linkedAppointmentId !== undefined && r.linkedAppointmentId !== null);
      // Sum all income records; use totalVisits as proxy if no linked records
      const directSpend = linked.reduce((sum, r) => sum + r.amount, 0);
      const visits = Number(client.totalVisits);
      if (visits > 0) {
        clientSpend[clientId] = {
          total: directSpend,
          count: visits,
          name: client.name,
        };
      }
    }

    // If no linked records, distribute total income proportionally by visits
    const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalVisits = clients.reduce((sum, c) => sum + Number(c.totalVisits), 0);
    const avgPerVisit = totalVisits > 0 ? totalIncome / totalVisits : 0;

    return clients
      .filter(c => Number(c.totalVisits) > 0)
      .map(c => {
        const spend = clientSpend[String(c.id)];
        const avgTicket = spend && spend.total > 0
          ? spend.total / spend.count
          : avgPerVisit;
        return { client: c, avgTicket };
      })
      .sort((a, b) => b.avgTicket - a.avgTicket)
      .slice(0, 5);
  }, [clients, financialRecords]);

  const inactivePercent = clients.length > 0
    ? Math.round((inactiveClients.length / clients.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Inactive Clients */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center">
              <UserX className="w-3.5 h-3.5 text-red-500" />
            </div>
            Clientes Inativos
            <Badge variant="destructive" className="ml-auto text-xs">
              {inactiveClients.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {inactiveClients.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Todos os clientes visitaram recentemente. 🎉</p>
          ) : (
            <>
              {inactiveClients.map(({ client, daysSinceVisit }) => (
                <div
                  key={String(client.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50/50 border border-red-100 text-sm"
                >
                  <span className="font-medium text-foreground flex-1 truncate">{client.name}</span>
                  <Badge variant="outline" className="text-xs text-red-600 border-red-200 shrink-0">
                    {daysSinceVisit}d sem visitar
                  </Badge>
                </div>
              ))}
              <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  {inactivePercent}% dos clientes não retornaram em {INACTIVE_DAYS}+ dias.
                  Reative com mensagem personalizada.
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Frequent Clients */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-blue-500" />
            </div>
            Clientes Frequentes
            <Badge variant="secondary" className="ml-auto text-xs">
              {frequentClients.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {frequentClients.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Nenhum cliente com visitas registradas ainda.</p>
          ) : (
            <>
              {frequentClients.map((client, rank) => (
                <div
                  key={String(client.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50/50 border border-blue-100 text-sm"
                >
                  <span className="text-xs font-bold text-blue-400 w-5 shrink-0">#{rank + 1}</span>
                  <span className="font-medium text-foreground flex-1 truncate">{client.name}</span>
                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-200 shrink-0">
                    {String(client.totalVisits)} visitas
                  </Badge>
                </div>
              ))}
              <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Recompense a fidelidade com um programa de pontos ou desconto especial.</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* VIP Clients */}
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
            </div>
            Clientes VIP
            <Badge className="ml-auto text-xs bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/20">
              {vipClients.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {vipClients.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">Nenhum dado financeiro disponível ainda.</p>
          ) : (
            <>
              {vipClients.map(({ client, avgTicket }, rank) => (
                <div
                  key={String(client.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50/50 border border-amber-100 text-sm"
                >
                  <span className="text-xs font-bold text-amber-400 w-5 shrink-0">#{rank + 1}</span>
                  <span className="font-medium text-foreground flex-1 truncate">{client.name}</span>
                  <Badge variant="outline" className="text-xs text-amber-700 border-amber-200 shrink-0">
                    {formatCurrency(avgTicket)} / visita
                  </Badge>
                </div>
              ))}
              <div className="flex items-start gap-2 text-xs text-muted-foreground pt-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>Ofereça serviços premium e tratamento exclusivo para clientes VIP.</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
