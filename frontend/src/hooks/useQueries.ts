import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { AppointmentStatus, BusinessType, FinancialType } from '../backend';
import type { Client, Appointment, FinancialRecord, Reminder } from '../backend';

// ─── Clients ────────────────────────────────────────────────────────────────

export function useGetAllClients() {
  const { actor, isFetching } = useActor();
  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      if (!actor) return [];
      const total = await actor.getTotalClients();
      const ids = Array.from({ length: Number(total) }, (_, i) => BigInt(i + 1));
      const results = await Promise.allSettled(ids.map(id => actor.getClient(id)));
      return results
        .filter((r): r is PromiseFulfilledResult<Client> => r.status === 'fulfilled')
        .map(r => r.value);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; phone: string; email: string; businessType: BusinessType }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.createClient(data.name, data.phone, data.email, data.businessType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; name: string; phone: string; email: string; businessType: BusinessType; notes: string }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.updateClient(data.id, data.name, data.phone, data.email, data.businessType, data.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useDeleteClient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.deleteClient(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// ─── Appointments ────────────────────────────────────────────────────────────

export function useGetAllAppointments() {
  const { actor, isFetching } = useActor();
  return useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      if (!actor) return [];
      const total = await actor.getTotalAppointments();
      const ids = Array.from({ length: Number(total) }, (_, i) => BigInt(i + 1));
      const results = await Promise.allSettled(ids.map(id => actor.getAppointment(id)));
      return results
        .filter((r): r is PromiseFulfilledResult<Appointment> => r.status === 'fulfilled')
        .map(r => r.value);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { clientId: bigint; service: string; dateTime: bigint; duration: bigint; notes: string }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.createAppointment(data.clientId, data.service, data.dateTime, data.duration, data.notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: bigint; status: AppointmentStatus }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.updateAppointmentStatus(data.id, data.status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useDeleteAppointment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.deleteAppointment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

// ─── Financial Records ───────────────────────────────────────────────────────

export function useGetAllFinancialRecords() {
  const { actor, isFetching } = useActor();
  return useQuery<FinancialRecord[]>({
    queryKey: ['financialRecords'],
    queryFn: async () => {
      if (!actor) return [];
      const total = await actor.getTotalFinancialRecords();
      const ids = Array.from({ length: Number(total) }, (_, i) => BigInt(i + 1));
      const results = await Promise.allSettled(ids.map(id => actor.getFinancialRecord(id)));
      return results
        .filter((r): r is PromiseFulfilledResult<FinancialRecord> => r.status === 'fulfilled')
        .map(r => r.value);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateFinancialRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      financialType: FinancialType;
      amount: number;
      category: string;
      date: bigint;
      description: string;
      linkedAppointmentId: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.createFinancialRecord(
        data.financialType,
        data.amount,
        data.category,
        data.date,
        data.description,
        data.linkedAppointmentId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialRecords'] });
    },
  });
}

export function useDeleteFinancialRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.deleteFinancialRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialRecords'] });
    },
  });
}

// ─── Retention ───────────────────────────────────────────────────────────────

export function useClientsNotVisitedSince(days: number) {
  const { actor, isFetching } = useActor();
  return useQuery<Client[]>({
    queryKey: ['clientsNotVisited', days],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getClientsNotVisitedSince(BigInt(days));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTopClientsByVisits(limit: number) {
  const { actor, isFetching } = useActor();
  return useQuery<Client[]>({
    queryKey: ['topClients', limit],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopClientsByVisits(BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGenerateMessageTemplates() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (data: { clientId: bigint; daysSinceLastVisit: number }) => {
      if (!actor) throw new Error('Actor not ready');
      return actor.generateMessageTemplates(data.clientId, BigInt(data.daysSinceLastVisit));
    },
  });
}

// ─── Reminders ───────────────────────────────────────────────────────────────

export function useReminders() {
  const { actor, isFetching } = useActor();
  return useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.generateReminders();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}
