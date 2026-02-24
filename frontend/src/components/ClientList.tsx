import { Users, Phone, Mail, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate, nanosToMs, getBusinessTypeLabel } from '@/lib/utils';
import type { Client } from '../backend';

interface ClientListProps {
  clients: Client[];
  selectedId?: bigint;
  onSelect: (client: Client) => void;
}

export function ClientList({ clients, selectedId, onSelect }: ClientListProps) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Users className="w-10 h-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-muted-foreground">Nenhum cliente encontrado</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Adicione seu primeiro cliente</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {clients.map(client => (
        <button
          key={String(client.id)}
          onClick={() => onSelect(client)}
          className={cn(
            'w-full text-left px-4 py-3.5 hover:bg-muted/50 transition-colors',
            selectedId === client.id && 'bg-primary/5 border-l-2 border-primary'
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{client.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  {client.phone}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <Badge variant="outline" className="text-xs">
                {getBusinessTypeLabel(client.businessType as string)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {Number(client.totalVisits)} visitas
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            Última visita: {formatDate(client.lastVisit)}
          </div>
        </button>
      ))}
    </div>
  );
}
