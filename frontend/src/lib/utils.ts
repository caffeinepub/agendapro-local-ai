import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AppointmentStatus } from '../backend';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: bigint | number): string {
  const ms = typeof timestamp === 'bigint' ? Number(timestamp) / 1_000_000 : timestamp;
  return new Date(ms).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(timestamp: bigint | number): string {
  const ms = typeof timestamp === 'bigint' ? Number(timestamp) / 1_000_000 : timestamp;
  return new Date(ms).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(timestamp: bigint | number): string {
  const ms = typeof timestamp === 'bigint' ? Number(timestamp) / 1_000_000 : timestamp;
  return new Date(ms).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function nanosToMs(nanos: bigint): number {
  return Number(nanos) / 1_000_000;
}

export function msToNanos(ms: number): bigint {
  return BigInt(Math.floor(ms * 1_000_000));
}

export function dateToNanos(date: Date): bigint {
  return msToNanos(date.getTime());
}

export function daysSince(timestamp: bigint): number {
  const ms = nanosToMs(timestamp);
  const now = Date.now();
  return Math.floor((now - ms) / (1000 * 60 * 60 * 24));
}

export function getStatusLabel(status: AppointmentStatus): string {
  const labels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.scheduled]: 'Agendado',
    [AppointmentStatus.completed]: 'Concluído',
    [AppointmentStatus.cancelled]: 'Cancelado',
  };
  return labels[status] || status;
}

export function getStatusClass(status: AppointmentStatus): string {
  const classes: Record<AppointmentStatus, string> = {
    [AppointmentStatus.scheduled]: 'status-scheduled',
    [AppointmentStatus.completed]: 'status-completed',
    [AppointmentStatus.cancelled]: 'status-cancelled',
  };
  return classes[status] || '';
}

export function getBusinessTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    barber: 'Barbearia',
    petshop: 'Pet Shop',
    salon: 'Salão',
    clinic: 'Clínica',
  };
  return labels[type] || type;
}
