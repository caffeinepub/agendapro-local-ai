import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Reminder {
    clientName: string;
    appointmentTime: bigint;
    reminderType: string;
    message: string;
}
export type Time = bigint;
export interface FinancialRecord {
    id: bigint;
    linkedAppointmentId?: bigint;
    date: Time;
    description: string;
    category: string;
    amount: number;
    financialType: FinancialType;
}
export interface Client {
    id: bigint;
    name: string;
    businessType: BusinessType;
    email: string;
    lastVisit: Time;
    notes: string;
    totalVisits: bigint;
    phone: string;
}
export interface Appointment {
    id: bigint;
    service: string;
    status: AppointmentStatus;
    duration: bigint;
    clientId: bigint;
    notes: string;
    dateTime: Time;
}
export enum AppointmentStatus {
    scheduled = "scheduled",
    cancelled = "cancelled",
    completed = "completed"
}
export enum BusinessType {
    clinic = "clinic",
    barber = "barber",
    salon = "salon",
    petshop = "petshop"
}
export enum FinancialType {
    expense = "expense",
    income = "income"
}
export interface backendInterface {
    createAppointment(clientId: bigint, service: string, dateTime: Time, duration: bigint, notes: string): Promise<Appointment>;
    createClient(name: string, phone: string, email: string, businessType: BusinessType): Promise<Client>;
    createFinancialRecord(financialType: FinancialType, amount: number, category: string, date: Time, description: string, linkedAppointmentId: bigint | null): Promise<FinancialRecord>;
    deleteAppointment(id: bigint): Promise<void>;
    deleteClient(id: bigint): Promise<void>;
    deleteFinancialRecord(id: bigint): Promise<void>;
    generateMessageTemplates(clientId: bigint, daysSinceLastVisit: bigint): Promise<Array<string>>;
    generateReminders(): Promise<Array<Reminder>>;
    getAppointment(id: bigint): Promise<Appointment>;
    getClient(id: bigint): Promise<Client>;
    getClientsNotVisitedSince(days: bigint): Promise<Array<Client>>;
    getFinancialRecord(id: bigint): Promise<FinancialRecord>;
    getTopClientsByVisits(limit: bigint): Promise<Array<Client>>;
    getTotalAppointments(): Promise<bigint>;
    getTotalClients(): Promise<bigint>;
    getTotalFinancialRecords(): Promise<bigint>;
    updateAppointmentStatus(id: bigint, status: AppointmentStatus): Promise<Appointment>;
    updateClient(id: bigint, name: string, phone: string, email: string, businessType: BusinessType, notes: string): Promise<Client>;
}
