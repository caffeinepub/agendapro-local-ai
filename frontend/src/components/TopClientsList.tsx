import { Star, MessageSquare, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Client } from '../backend';

interface TopClientsListProps {
  clients: Client[];
  onGenerateMessage: (client: Client) => void;
}

const medalColors = [
  'text-yellow-500',
  'text-slate-400',
  'text-amber-600',
  'text-muted-foreground',
  'text-muted-foreground',
];

export function TopClientsList({ clients, onGenerateMessage }: TopClientsListProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Trophy className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Nenhum cliente ainda</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Os top clientes aparecerão aqui</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {clients.map((client, index) => (
        <div
          key={String(client.id)}
          className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 flex-shrink-0">
              {index < 3 ? (
                <Trophy className={cn('w-5 h-5', medalColors[index])} />
              ) : (
                <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold text-xs">
                {client.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">{client.name}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <Star className="w-3 h-3 fill-primary text-primary" />
                <span>{Number(client.totalVisits)} visitas</span>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs flex-shrink-0"
            onClick={() => onGenerateMessage(client)}
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            Mensagem
          </Button>
        </div>
      ))}
    </div>
  );
}
