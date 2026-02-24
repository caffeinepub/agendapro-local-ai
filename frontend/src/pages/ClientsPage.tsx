import { useState, useMemo } from 'react';
import { Users, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClientList } from '@/components/ClientList';
import { ClientDetailPanel } from '@/components/ClientDetailPanel';
import { ClientFormDialog } from '@/components/ClientFormDialog';
import { MessageTemplateDialog } from '@/components/MessageTemplateDialog';
import { CrmInsightsPanel } from '@/components/CrmInsightsPanel';
import { useGetAllClients, useGetAllAppointments, useGenerateMessageTemplates, useGetAllFinancialRecords } from '@/hooks/useQueries';
import { daysSince } from '@/lib/utils';
import type { Client } from '../backend';

export function ClientsPage() {
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [msgDialogOpen, setMsgDialogOpen] = useState(false);
  const [msgTemplates, setMsgTemplates] = useState<string[]>([]);

  const { data: clients = [], isLoading } = useGetAllClients();
  const { data: appointments = [] } = useGetAllAppointments();
  const { data: financialRecords = [] } = useGetAllFinancialRecords();
  const generateTemplates = useGenerateMessageTemplates();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const handleEdit = (client: Client) => {
    setEditClient(client);
    setFormOpen(true);
  };

  const handleGenerateMessage = async (client: Client) => {
    const days = daysSince(client.lastVisit);
    const templates = await generateTemplates.mutateAsync({
      clientId: client.id,
      daysSinceLastVisit: days,
    });
    setMsgTemplates(templates);
    setMsgDialogOpen(true);
  };

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Clientes</h1>
              <p className="text-xs text-muted-foreground">{clients.length} cadastrados</p>
            </div>
          </div>
          <Button size="sm" onClick={() => { setEditClient(null); setFormOpen(true); }}>
            <Plus className="w-4 h-4 mr-1.5" />
            Novo
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 lg:px-6 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, telefone ou email..."
              className="pl-9"
            />
          </div>
        </div>

        {/* CRM Insights Panel */}
        {!isLoading && clients.length > 0 && (
          <div className="px-4 lg:px-6 py-4 border-b border-border bg-muted/20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              📊 CRM Insights
            </p>
            <CrmInsightsPanel clients={clients} financialRecords={financialRecords} />
          </div>
        )}

        {/* List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <ClientList
              clients={filtered}
              selectedId={selectedClient?.id}
              onSelect={setSelectedClient}
            />
          )}
        </ScrollArea>
      </div>

      {/* Right Panel - Detail */}
      {selectedClient ? (
        <div className="w-80 xl:w-96 flex-shrink-0">
          <ClientDetailPanel
            client={selectedClient}
            appointments={appointments}
            onEdit={() => handleEdit(selectedClient)}
            onClose={() => setSelectedClient(null)}
            onGenerateMessage={() => handleGenerateMessage(selectedClient)}
          />
        </div>
      ) : (
        <div className="hidden lg:flex w-80 xl:w-96 flex-shrink-0 items-center justify-center bg-muted/20">
          <div className="text-center">
            <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Selecione um cliente</p>
          </div>
        </div>
      )}

      <ClientFormDialog
        open={formOpen}
        onOpenChange={open => {
          setFormOpen(open);
          if (!open) setEditClient(null);
        }}
        editClient={editClient}
      />

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
