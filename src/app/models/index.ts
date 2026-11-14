export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  billingAddress: string;
  gstNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LineItem {
  id?: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName?: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  dueDate: Date;
  status: InvoiceStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardMetrics {
  totalInvoices: number;
  totalRevenue: number;
  outstandingPayments: number;
  overdueInvoices: number;
  paidInvoices: number;
  draftInvoices: number;
  monthlyRevenue: { month: string; revenue: number }[];
  invoiceStatusDistribution: { status: string; count: number }[];
  recentInvoices: Invoice[];
}

export interface ReportFilter {
  startDate: Date;
  endDate: Date;
  customerId?: number;
  status?: InvoiceStatus;
}