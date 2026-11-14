import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatIconModule, MatTableModule, MatChipsModule
  ],
  template: `
    <div class="invoice-detail" *ngIf="invoice">
      <div class="header">
        <button mat-stroked-button routerLink="/invoices">
          <mat-icon>arrow_back</mat-icon> Back
        </button>
        <div class="actions">
          <button mat-raised-button color="primary" [routerLink]="['/invoices', invoice.id, 'edit']">
            <mat-icon>edit</mat-icon> Edit
          </button>
          <button mat-stroked-button color="warn" (click)="deleteInvoice()">
            <mat-icon>delete</mat-icon> Delete
          </button>
        </div>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="invoice-header">
            <div>
              <h1>{{ invoice.invoiceNumber }}</h1>
              <span class="status-badge" [class.paid]="invoice.status === 'paid'"
                    [class.overdue]="invoice.status === 'overdue'"
                    [class.draft]="invoice.status === 'draft'">
                {{ invoice.status }}
              </span>
            </div>
            <div class="invoice-dates">
              <p>Created: {{ invoice.createdAt | date:'mediumDate' }}</p>
              <p>Due: <strong>{{ invoice.dueDate | date:'mediumDate' }}</strong></p>
            </div>
          </div>

          <div class="customer-info">
            <h3>Customer</h3>
            <p>{{ invoice.customerName || 'N/A' }}</p>
          </div>

          <h3>Line Items</h3>
          <table mat-table [dataSource]="invoice.lineItems" class="full-width">
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Description</th>
              <td mat-cell *matCellDef="let item">{{ item.description }}</td>
            </ng-container>
            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef class="num-col">Qty</th>
              <td mat-cell *matCellDef="let item" class="num-col">{{ item.quantity }}</td>
            </ng-container>
            <ng-container matColumnDef="unitPrice">
              <th mat-header-cell *matHeaderCellDef class="num-col">Unit Price</th>
              <td mat-cell *matCellDef="let item" class="num-col">\${{ item.unitPrice?.toFixed(2) }}</td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef class="num-col">Total</th>
              <td mat-cell *matCellDef="let item" class="num-col">\${{ item.total?.toFixed(2) }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="['description', 'quantity', 'unitPrice', 'total']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['description', 'quantity', 'unitPrice', 'total'];"></tr>
          </table>

          <div class="summary">
            <div class="summary-row"><span>Subtotal:</span><span>\${{ invoice.subtotal.toFixed(2) }}</span></div>
                        <div class="summary-row"><span>Tax ({{ invoice.taxRate }}%):</span><span>\${{ invoice.taxAmount.toFixed(2) }}</span></div>
                        <div class="summary-row" *ngIf="invoice.discount"><span>Discount:</span><span>-\${{ invoice.discount.toFixed(2) }}</span></div>
                        <div class="summary-row total"><span>Total:</span><span>\${{ invoice.total.toFixed(2) }}</span></div>
          </div>

          <div class="notes" *ngIf="invoice.notes">
            <h3>Notes</h3>
            <p>{{ invoice.notes }}</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .invoice-detail { max-width: 900px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .actions { display: flex; gap: 8px; }
    .invoice-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
    .invoice-header h1 { margin: 0 0 8px; font-size: 24px; }
    .invoice-dates { text-align: right; color: #666; }
    .customer-info { margin-bottom: 24px; padding: 16px; background: #f5f5f5; border-radius: 4px; }
    .customer-info h3 { margin: 0 0 8px; }
    .full-width { width: 100%; margin-bottom: 24px; }
    .num-col { text-align: right; }
    .summary { margin-left: auto; max-width: 400px; }
    .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 16px; }
    .summary-row.total { font-size: 20px; font-weight: 600; border-top: 1px solid #ccc; padding-top: 8px; margin-top: 8px; }
    .notes { margin-top: 24px; padding: 16px; background: #fff9c4; border-radius: 4px; }
    .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; text-transform: uppercase; display: inline-block; }
    .status-badge.paid { background: #c8e6c9; color: #2e7d32; }
    .status-badge.overdue { background: #ffcdd2; color: #c62828; }
    .status-badge.draft { background: #fff9c4; color: #f57f17; }
  `]
})
export class InvoiceDetailComponent implements OnInit {
  invoice?: Invoice;

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.params['id'];
    this.invoiceService.getInvoice(id).subscribe({ next: (inv) => this.invoice = inv });
  }

  deleteInvoice(): void {
    if (confirm('Delete this invoice?')) {
      this.invoiceService.deleteInvoice(this.invoice!.id).subscribe({ next: () => this.router.navigate(['/invoices']) });
    }
  }
}