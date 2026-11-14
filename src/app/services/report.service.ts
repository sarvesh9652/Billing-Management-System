import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { jsPDF } from 'jspdf';
import { DashboardMetrics, Invoice, ReportFilter } from '../models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  getDashboardMetrics(): Observable<DashboardMetrics> {
    const invoices = this.readInvoices();
    const totalRevenue = invoices
      .filter((invoice) => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.total, 0);
    const outstandingPayments = invoices
      .filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.total, 0);
    const overdueInvoices = invoices.filter((invoice) => invoice.status === 'overdue').length;
    const paidInvoices = invoices.filter((invoice) => invoice.status === 'paid').length;
    const draftInvoices = invoices.filter((invoice) => invoice.status === 'draft').length;
    const monthlyRevenue = Array.from({ length: 6 }, (_, index) => {
      const month = new Date();
      month.setDate(1);
      month.setHours(0, 0, 0, 0);
      month.setMonth(month.getMonth() - (5 - index));

      return {
        month: month.toLocaleString('en-US', { month: 'short' }),
        revenue: invoices
          .filter((invoice) => {
            const paidAt = new Date(invoice.updatedAt);
            return invoice.status === 'paid' &&
              paidAt.getFullYear() === month.getFullYear() &&
              paidAt.getMonth() === month.getMonth();
          })
          .reduce((sum, invoice) => sum + invoice.total, 0)
      };
    });

    return of({
      totalInvoices: invoices.length,
      totalRevenue,
      outstandingPayments,
      overdueInvoices,
      paidInvoices,
      draftInvoices,
      monthlyRevenue,
      invoiceStatusDistribution: [
        { status: 'Paid', count: paidInvoices },
        { status: 'Sent', count: invoices.filter((invoice) => invoice.status === 'sent').length },
        { status: 'Overdue', count: overdueInvoices },
        { status: 'Draft', count: draftInvoices },
        { status: 'Cancelled', count: invoices.filter((invoice) => invoice.status === 'cancelled').length }
      ],
      recentInvoices: invoices
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    });
  }

  getRevenueReport(filter?: ReportFilter): Observable<Blob> {
    const invoices = this.filterInvoices(filter).filter((invoice) => invoice.status === 'paid');
    return of(this.toCsvBlob(this.invoiceRows(invoices)));
  }

  exportReport(format: 'pdf' | 'csv', type: string, filter?: ReportFilter): Observable<Blob> {
    const rows = this.reportRows(type, this.filterInvoices(filter));
    const blob = format === 'csv' ? this.toCsvBlob(rows) : this.toPdfBlob(type, rows);
    return of(blob);
  }

  private reportRows(type: string, invoices: Invoice[]): string[][] {
    if (type === 'outstanding') {
      return [
        ['Invoice Number', 'Customer', 'Status', 'Due Date', 'Outstanding Amount'],
        ...invoices
          .filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')
          .map((invoice) => [
            invoice.invoiceNumber,
            invoice.customerName || 'Unknown',
            invoice.status,
            this.formatDate(invoice.dueDate),
            invoice.total.toFixed(2)
          ])
      ];
    }

    if (type === 'customer-history') {
      const history = new Map<string, { invoices: number; paid: number; amount: number }>();
      for (const invoice of invoices) {
        const customer = invoice.customerName || 'Unknown';
        const item = history.get(customer) || { invoices: 0, paid: 0, amount: 0 };
        item.invoices += 1;
        if (invoice.status === 'paid') {
          item.paid += 1;
          item.amount += invoice.total;
        }
        history.set(customer, item);
      }

      return [
        ['Customer', 'Invoice Count', 'Paid Invoices', 'Paid Amount'],
        ...Array.from(history.entries()).map(([customer, summary]) => [
          customer,
          String(summary.invoices),
          String(summary.paid),
          summary.amount.toFixed(2)
        ])
      ];
    }

    if (type === 'revenue') {
      return [
        ['Invoice Number', 'Customer', 'Paid Date', 'Amount'],
        ...invoices
          .filter((invoice) => invoice.status === 'paid')
          .map((invoice) => [
            invoice.invoiceNumber,
            invoice.customerName || 'Unknown',
            this.formatDate(invoice.updatedAt),
            invoice.total.toFixed(2)
          ])
      ];
    }

    return this.invoiceRows(invoices);
  }

  private invoiceRows(invoices: Invoice[]): string[][] {
    return [
      ['Invoice Number', 'Customer', 'Status', 'Amount', 'Due Date'],
      ...invoices.map((invoice) => [
        invoice.invoiceNumber,
        invoice.customerName || 'Unknown',
        invoice.status,
        invoice.total.toFixed(2),
        this.formatDate(invoice.dueDate)
      ])
    ];
  }

  private toPdfBlob(type: string, rows: string[][]): Blob {
    const pdf = new jsPDF();
    const title = type.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 14;
    let y = 20;

    pdf.setFontSize(18);
    pdf.text(`${title} Report`, margin, y);
    pdf.setFontSize(9);
    y += 8;
    pdf.text(`Generated ${new Date().toLocaleString()} | ${Math.max(0, rows.length - 1)} records`, margin, y);
    y += 10;

    rows.forEach((row, rowIndex) => {
      const line = row.join('  |  ');
      const wrapped = pdf.splitTextToSize(line, pageWidth - margin * 2) as string[];
      const lineHeight = rowIndex === 0 ? 7 : 6;
      if (y + wrapped.length * lineHeight > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        y = margin;
      }

      pdf.setFont('helvetica', rowIndex === 0 ? 'bold' : 'normal');
      pdf.setFontSize(rowIndex === 0 ? 10 : 9);
      pdf.text(wrapped, margin, y);
      y += wrapped.length * lineHeight;
    });

    return pdf.output('blob');
  }

  private filterInvoices(filter?: ReportFilter): Invoice[] {
    const invoices = this.readInvoices();
    const endDate = filter?.endDate ? new Date(filter.endDate) : undefined;
    endDate?.setHours(23, 59, 59, 999);

    return invoices.filter((invoice) => {
      const matchesDate =
        (!filter?.startDate || new Date(invoice.createdAt) >= new Date(filter.startDate)) &&
        (!endDate || new Date(invoice.createdAt) <= endDate);
      const matchesCustomer = !filter?.customerId || invoice.customerId === filter.customerId;
      const matchesStatus = !filter?.status || invoice.status === filter.status;
      return matchesDate && matchesCustomer && matchesStatus;
    });
  }

  private readInvoices(): Invoice[] {
    const raw = localStorage.getItem('bms_invoices');
    if (!raw) return [];

    try {
      return JSON.parse(raw) as Invoice[];
    } catch {
      localStorage.removeItem('bms_invoices');
      return [];
    }
  }

  private toCsvBlob(rows: Array<Array<string | number>>): Blob {
    const text = rows
      .map((row) => row.map((cell) => {
        const value = String(cell);
        const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
        return `"${safeValue.replace(/"/g, '""')}"`;
      }).join(','))
      .join('\n');

    return new Blob([text], { type: 'text/csv;charset=utf-8;' });
  }

  private formatDate(value: Date | string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  }
}