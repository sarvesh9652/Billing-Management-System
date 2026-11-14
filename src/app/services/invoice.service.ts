import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Invoice, InvoiceStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly storageKey = 'bms_invoices';

  constructor() {
    this.seedInvoices();
  }

  getInvoices(page = 0, limit = 10, status?: InvoiceStatus, search?: string): Observable<{ data: Invoice[]; total: number }> {
    return of(this.getAllInvoices()).pipe(
      map((invoices) => {
        const term = search?.trim().toLowerCase();
        const filteredByStatus = status ? invoices.filter((invoice) => invoice.status === status) : invoices;
        const filtered = !term
          ? filteredByStatus
          : filteredByStatus.filter((invoice) =>
              `${invoice.invoiceNumber} ${invoice.customerName || ''}`.toLowerCase().includes(term)
            );
        const start = page * limit;

        return {
          data: filtered.slice(start, start + limit),
          total: filtered.length
        };
      })
    );
  }

  getInvoice(id: number): Observable<Invoice> {
    return of(this.getAllInvoices()).pipe(
      map((invoices) => invoices.find((invoice) => invoice.id === id) as Invoice)
    );
  }

  createInvoice(invoice: Partial<Invoice>): Observable<Invoice> {
    return of(null).pipe(
      map(() => {
        const invoices = this.getAllInvoices();
        const newInvoice: Invoice = {
          id: Date.now(),
          invoiceNumber: invoice.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
          customerId: invoice.customerId || 1,
          customerName: invoice.customerName || 'Demo Customer',
          lineItems: invoice.lineItems || [],
          subtotal: invoice.subtotal || 0,
          taxRate: invoice.taxRate || 0,
          taxAmount: invoice.taxAmount || 0,
          discount: invoice.discount || 0,
          total: invoice.total || 0,
          dueDate: invoice.dueDate || new Date(),
          status: invoice.status || 'draft',
          notes: invoice.notes || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        invoices.unshift(newInvoice);
        this.saveInvoices(invoices);
        return newInvoice;
      })
    );
  }

  updateInvoice(id: number, invoice: Partial<Invoice>): Observable<Invoice> {
    return of(null).pipe(
      map(() => {
        const invoices = this.getAllInvoices();
        const index = invoices.findIndex((item) => item.id === id);

        if (index === -1) {
          throw new Error('Invoice not found.');
        }

        const updatedInvoice: Invoice = {
          ...invoices[index],
          ...invoice,
          updatedAt: new Date()
        };

        invoices[index] = updatedInvoice;
        this.saveInvoices(invoices);
        return updatedInvoice;
      })
    );
  }

  deleteInvoice(id: number): Observable<void> {
    return of(null).pipe(
      map(() => {
        const invoices = this.getAllInvoices().filter((invoice) => invoice.id !== id);
        this.saveInvoices(invoices);
      })
    );
  }

  generateInvoiceNumber(): Observable<string> {
    return of(`INV-${Date.now().toString().slice(-6)}`);
  }

  private seedInvoices(): void {
    if (localStorage.getItem(this.storageKey)) {
      return;
    }

    const now = new Date();
    const defaultInvoices: Invoice[] = [
      {
        id: 1,
        invoiceNumber: 'INV-1001',
        customerId: 1,
        customerName: 'Apex Labs',
        lineItems: [
          { id: 1, description: 'Consulting services', quantity: 12, unitPrice: 120, total: 1440 },
          { id: 2, description: 'Support plan', quantity: 1, unitPrice: 240, total: 240 }
        ],
        subtotal: 1680,
        taxRate: 8,
        taxAmount: 134.4,
        discount: 0,
        total: 1814.4,
        dueDate: new Date(now.getTime() + 86400000 * 12),
        status: 'sent',
        notes: 'Quarterly account review',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        invoiceNumber: 'INV-1002',
        customerId: 2,
        customerName: 'Northwind Retail',
        lineItems: [
          { id: 1, description: 'Inventory analytics', quantity: 6, unitPrice: 200, total: 1200 }
        ],
        subtotal: 1200,
        taxRate: 8,
        taxAmount: 96,
        discount: 50,
        total: 1246,
        dueDate: new Date(now.getTime() - 86400000 * 5),
        status: 'overdue',
        notes: 'Overdue by 5 days',
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        invoiceNumber: 'INV-1003',
        customerId: 3,
        customerName: 'Harbor Studio',
        lineItems: [
          { id: 1, description: 'Brand design sprint', quantity: 2, unitPrice: 950, total: 1900 }
        ],
        subtotal: 1900,
        taxRate: 8,
        taxAmount: 152,
        discount: 0,
        total: 2052,
        dueDate: new Date(now.getTime() + 86400000 * 30),
        status: 'paid',
        notes: 'Paid in full',
        createdAt: now,
        updatedAt: now
      }
    ];

    this.saveInvoices(defaultInvoices);
  }

  private getAllInvoices(): Invoice[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as Invoice[];
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }

  private saveInvoices(invoices: Invoice[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(invoices));
  }
}