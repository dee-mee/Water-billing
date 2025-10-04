export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  accountNumber?: string;
}

export interface Bill {
  id: string;
  customerId: string;
  period: string; // e.g., "August 2024"
  previousReading: number;
  currentReading: number;
  consumption: number; // in m³
  rate: number; // price per m³
  amountDue: number;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Pending Approval';
  approved?: boolean;
}

export interface Customer {
    id: string;
    name: string;
    accountNumber: string;
    meterNumber: string;
    phone: string;
    lastReading: number;
    lastReadingDate: string;
}

export interface DashboardStats {
    totalCustomers: number;
    billsAwaitingPayment: number;
    totalOverdueAmount: number;
}

export interface BulkUploadResult {
    successCount: number;
    errorCount: number;
    errors: { accountNumber: string; reason: string }[];
}

export interface BillWithCustomerInfo extends Bill {
    customerName: string;
    customerAccountNumber: string;
}

export interface MeterMetric {
    meterNumber: string;
    customerName: string;
    customerAccountNumber: string;
    totalConsumption: number;
}

export interface CustomerProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    accountNumber: string;
    meterNumber: string;
}