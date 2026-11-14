import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice, InvoiceStatus } from '../../models';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatPaginatorModule, MatChipsModule, MatMenuModule
  ],
  template: `
    <div class="invoice-list">
      <div class="header">
        <h1>Invoices</h1>
        <button mat-raised-button color="primary" routerLink="/invoices/new">
          <mat-icon>add</mat-icon> New Invoice
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search invoices...</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Invoice # or customer">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="status-field">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="statusFilter" (selectionChange)="onFilterChange()">
                <mat-option value="">All</mat-option>
                <mat-option value="draft">Draft</mat-option>
                <mat-option value="sent">Sent</mat-option>
                <mat-option value="paid">Paid</mat-option>
                <mat-option value="overdue">Overdue</mat-option>
                <mat-option value="cancelled">Cancelled</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <table mat-table [dataSource]="invoices" class="full-width">
            <ng-container matColumnDef="invoiceNumber">
              <th mat-header-cell *matHeaderCellDef>Invoice #</th>
              <td mat-cell *matCellDef="let inv">
                <a [routerLink]="['/invoices', inv.id]" class="invoice-link">{{ inv.invoiceNumber }}</a>
              </td>
            </ng-container>
            <ng-container matColumnDef="customerName">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let inv">{{ inv.customerName || 'N/A' }}</td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Amount</th>
              <td mat-cell *matCellDef="let inv">\${{ inv.total?.toFixed(2) }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let inv">
                <span class="status-badge" [class.paid]="inv.status === 'paid'"
                      [class.overdue]="inv.status === 'overdue'"
                      [class.draft]="inv.status === 'draft'"
                      [class.cancelled]="inv.status === 'cancelled'"
                      [class.sent]="inv.status === 'sent'">
                  {{ inv.status }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="dueDate">
              <th mat-header-cell *matHeaderCellDef>Due Date</th>
              <td mat-cell *matCellDef="let inv">{{ inv.dueDate | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let inv">
                <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
                <mat-menu #menu="matMenu">
                  <a mat-menu-item [routerLink]="['/invoices', inv.id]"><mat-icon>visibility</mat-icon> View</a>
                  <a mat-menu-item [routerLink]="['/invoices', inv.id, 'edit']"><mat-icon>edit</mat-icon> Edit</a>
                  <button mat-menu-item (click)="deleteInvoice(inv.id)"><mat-icon color="warn">delete</mat-icon> Delete</button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div class="empty-state" *ngIf="invoices.length === 0">
            <mat-icon>receipt_long</mat-icon>
            <p>No invoices found</p>
            <button mat-stroked-button color="primary" routerLink="/invoices/new">Create Invoice</button>
          </div>

          <mat-paginator [length]="totalItems" [pageIndex]="pageIndex" [pageSize]="pageSize" [pageSizeOptions]="[5, 10, 25]"
                         (page)="onPageChange($event)" showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .invoice-list { max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 400; }
    .filters { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .search-field { flex: 1; min-width: 200px; }
    .status-field { width: 180px; }
    .full-width { width: 100%; }
    .invoice-link { color: #3f51b5; text-decoration: none; font-weight: 500; }
    .invoice-link:hover { text-decoration: underline; }
    .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; text-transform: uppercase; }
    .status-badge.paid { background: #c8e6c9; color: #2e7d32; }
    .status-badge.overdue { background: #ffcdd2; color: #c62828; }
    .status-badge.draft { background: #fff9c4; color: #f57f17; }
    .status-badge.sent { background: #bbdefb; color: #1565c0; }
    .status-badge.cancelled { background: #e0e0e0; color: #616161; }
    .empty-state { text-align: center; padding: 60px 20px; color: #999; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    @media (max-width: 768px) { .header { flex-direction: column; gap: 12px; align-items: stretch; } }
  `]
})
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  totalItems = 0;
  searchTerm = '';
  statusFilter = '';
  pageIndex = 0;
  pageSize = 10;
  displayedColumns = ['invoiceNumber', 'customerName', 'total', 'status', 'dueDate', 'actions'];

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void { this.loadInvoices(); }

  loadInvoices(): void {
    this.invoiceService.getInvoices(
      this.pageIndex,
      this.pageSize,
      this.statusFilter as InvoiceStatus || undefined,
      this.searchTerm
    )
      .subscribe({ next: (res) => { this.invoices = res.data; this.totalItems = res.total; } });
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.loadInvoices();
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.loadInvoices();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadInvoices();
  }

  deleteInvoice(id: number): void {
    if (confirm('Are you sure you want to delete this invoice?')) {
      this.invoiceService.deleteInvoice(id).subscribe({ next: () => this.loadInvoices() });
    }
  }
}