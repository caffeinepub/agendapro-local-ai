import { AlertTriangle, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, daysSince } from '@/lib/utils';
import type { Client } from '../backend';

interface AtRiskClientsListProps {
  clients: Client[];
  onGenerateMessage: (client: Client) => void;
}

export function AtRiskClientsList({ clients, onGenerateMessage }: AtRiskClientsListProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
          <AlertTriangle className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <p className="text-sm font-medium text-foreground">Nenhum cliente em risco</p>
        <p className="text-xs text-muted-foreground mt-1">Todos os clientes visitaram recentemente</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {clients.map(client => {
        const days = daysSince(client.lastVisit);
        const isHighRisk = days >= 60;
        return (
          <div
            key={String(client.id)}
            className={cn(
              'flex items-center justify-between p-3.5 rounded-xl border transition-colors',
              isHighRisk
                ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'
                : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30'
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold',
                isHighRisk ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
              )}>
                {client.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{client.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>{days} dias sem visita</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  isHighRisk ? 'border-red-300 text-red-700 dark:border-red-700 dark:text-red-400' : 'border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400'
                )}
              >
                {isHighRisk ? 'Alto risco' : 'Atenção'}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => onGenerateMessage(client)}
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Mensagem
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
