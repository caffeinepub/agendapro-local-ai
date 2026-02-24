import { useState } from 'react';
import { TrendingUp, AlertTriangle, Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AtRiskClientsList } from '@/components/AtRiskClientsList';
import { TopClientsList } from '@/components/TopClientsList';
import { MessageTemplateDialog } from '@/components/MessageTemplateDialog';
import { useClientsNotVisitedSince, useTopClientsByVisits, useGenerateMessageTemplates } from '@/hooks/useQueries';
import { daysSince } from '@/lib/utils';
import type { Client } from '../backend';

export function RetentionPage() {
  const [msgDialogOpen, setMsgDialogOpen] = useState(false);
  const [msgTemplates, setMsgTemplates] = useState<string[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { data: atRiskClients = [], isLoading: loadingAtRisk, refetch: refetchAtRisk } = useClientsNotVisitedSince(30);
  const { data: topClients = [], isLoading: loadingTop, refetch: refetchTop } = useTopClientsByVisits(5);
  const generateTemplates = useGenerateMessageTemplates();

  const handleGenerateMessage = async (client: Client) => {
    setSelectedClient(client);
    const days = daysSince(client.lastVisit);
    const templates = await generateTemplates.mutateAsync({
      clientId: client.id,
      daysSinceLastVisit: days,
    });
    setMsgTemplates(templates);
    setMsgDialogOpen(true);
  };

  const handleRefresh = () => {
    refetchAtRisk();
    refetchTop();
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">Retenção de Clientes</h1>
            <p className="text-xs text-muted-foreground">Insights para aumentar o retorno</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Atualizar
        </Button>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-400">Em Risco</span>
          </div>
          <p className="text-3xl font-bold font-display text-red-700 dark:text-red-400">
            {atRiskClients.length}
          </p>
          <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">clientes sem visita há 30+ dias</p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Top Clientes</span>
          </div>
          <p className="text-3xl font-bold font-display text-primary">
            {topClients.length}
          </p>
          <p className="text-xs text-primary/60 mt-0.5">clientes mais frequentes</p>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At Risk */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="font-display font-semibold text-base">Clientes em Risco</h2>
            <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {atRiskClients.length}
            </span>
          </div>
          {loadingAtRisk ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : (
            <AtRiskClientsList clients={atRiskClients} onGenerateMessage={handleGenerateMessage} />
          )}
        </div>

        {/* Top Clients */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-primary" />
            <h2 className="font-display font-semibold text-base">Top 5 Clientes</h2>
            <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {topClients.length}
            </span>
          </div>
          {loadingTop ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : (
            <TopClientsList clients={topClients} onGenerateMessage={handleGenerateMessage} />
          )}
        </div>
      </div>

      <MessageTemplateDialog
        open={msgDialogOpen}
        onOpenChange={setMsgDialogOpen}
        clientName={selectedClient?.name ?? ''}
        templates={msgTemplates}
        isLoading={generateTemplates.isPending}
      />
    </div>
  );
}
