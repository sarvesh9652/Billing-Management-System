import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { InvoiceService } from '../../services/invoice.service';
import { CustomerService } from '../../services/customer.service';
import { Invoice, LineItem, Customer, InvoiceStatus } from '../../models';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatTableModule
  ],
  template: `
    <div class="invoice-form">
      <h1>{{ isEdit ? 'Edit' : 'Create' }} Invoice</h1>

      <mat-card>
        <mat-card-content>
          <div class="error-message" *ngIf="error">{{ error }}</div>
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Invoice Number</mat-label>
              <input matInput [(ngModel)]="invoice.invoiceNumber" required>
            </mat-form-field>
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Customer</mat-label>
              <mat-select [(ngModel)]="invoice.customerId" required>
                <mat-option *ngFor="let c of customers" [value]="c.id">{{ c.name }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Due Date</mat-label>
              <input matInput [matDatepicker]="picker" [(ngModel)]="invoice.dueDate" required>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="invoice.status" required>
                <mat-option value="draft">Draft</mat-option>
                <mat-option value="sent">Sent</mat-option>
                <mat-option value="paid">Paid</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <h3>Line Items</h3>
          <table class="items-table" *ngIf="invoice.lineItems && invoice.lineItems.length > 0">
            <thead>
              <tr>
                <th>Description</th>
                <th class="num-col">Qty</th>
                <th class="num-col">Unit Price</th>
                <th class="num-col">Total</th>
                <th class="action-col"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of invoice.lineItems; let i = index">
                <td><input [(ngModel)]="item.description" name="desc-{{i}}" placeholder="Enter description" class="item-input"></td>
                <td><input type="number" [(ngModel)]="item.quantity" name="qty-{{i}}" min="1" class="num-input" (input)="updateLineItem(i)"></td>
                <td><input type="number" [(ngModel)]="item.unitPrice" name="price-{{i}}" min="0" step="0.01" class="num-input" (input)="updateLineItem(i)"></td>
                <td class="num-col">\${{ item.total.toFixed(2) }}</td>
                <td><button mat-icon-button color="warn" type="button" (click)="removeLineItem(i)"><mat-icon>close</mat-icon></button></td>
              </tr>
            </tbody>
          </table>

          <button mat-button type="button" (click)="addLineItem()">
            <mat-icon>add</mat-icon> Add Line Item
          </button>

          <div class="summary">
            <div class="summary-row"><span>Subtotal:</span><span>\${{ invoice.subtotal?.toFixed(2) }}</span></div>
            <div class="summary-row">
              <span>Tax Rate:</span>
              <mat-form-field appearance="outline" class="tax-input">
                <input matInput type="number" [(ngModel)]="invoice.taxRate" min="0" max="100" (input)="calculateTotals()">%
              </mat-form-field>
            </div>
            <div class="summary-row"><span>Tax Amount:</span><span>\${{ invoice.taxAmount?.toFixed(2) }}</span></div>
            <div class="summary-row">
              <span>Discount:</span>
              <mat-form-field appearance="outline" class="tax-input">
                <input matInput type="number" [(ngModel)]="invoice.discount" min="0" (input)="calculateTotals()">
              </mat-form-field>
            </div>
            <div class="summary-row total"><span>Total:</span><span>\${{ invoice.total?.toFixed(2) }}</span></div>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea matInput [(ngModel)]="invoice.notes" rows="3"></textarea>
          </mat-form-field>

          <div class="form-actions">
            <button mat-stroked-button routerLink="/invoices">Cancel</button>
            <button mat-raised-button color="primary" (click)="saveInvoice()" [disabled]="saving">
              {{ saving ? 'Saving...' : (isEdit ? 'Update' : 'Create') + ' Invoice' }}
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .invoice-form { max-width: 900px; margin: 0 auto; }
    h1 { margin-bottom: 24px; font-size: 28px; font-weight: 400; }
    .form-row { display: flex; gap: 16px; margin-bottom: 16px; }
    .half-width { flex: 1; }
    .full-width { width: 100%; margin-bottom: 16px; }
    h3 { margin: 24px 0 12px; color: #333; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    .items-table th { text-align: left; padding: 8px; background: #f5f5f5; font-weight: 500; font-size: 14px; }
    .items-table td { padding: 4px 8px; border-bottom: 1px solid #e0e0e0; }
    .num-col { text-align: right; width: 100px; }
    .action-col { width: 50px; }
    .item-input { border: none; border-bottom: 1px solid #ddd; width: 100%; padding: 4px; font-size: 14px; }
    .item-input:focus { outline: none; border-bottom-color: #3f51b5; }
    .num-input { border: none; border-bottom: 1px solid #ddd; width: 80px; padding: 4px; text-align: right; }
    .num-input:focus { outline: none; border-bottom-color: #3f51b5; }
    .summary { margin-top: 24px; border-top: 2px solid #333; padding-top: 16px; max-width: 400px; margin-left: auto; }
    .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; font-size: 16px; }
    .summary-row.total { font-size: 20px; font-weight: 600; border-top: 1px solid #ccc; padding-top: 8px; margin-top: 8px; }
    .tax-input { width: 100px; margin: 0; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
    .error-message { margin-bottom: 16px; padding: 10px 12px; border-radius: 10px; color: #b42318; background: #fee4e2; }
    @media (max-width: 768px) { .form-row { flex-direction: column; } }
  `]
})
export class InvoiceFormComponent implements OnInit {
  isEdit = false;
  invoiceId?: number;
  customers: Customer[] = [];
  error = '';
  saving = false;

  invoice: Partial<Invoice> = {
    invoiceNumber: '',
    lineItems: [],
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    total: 0,
    status: 'draft',
    dueDate: new Date(),
    notes: ''
  };

  constructor(
    private invoiceService: InvoiceService,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    if (this.route.snapshot.params['id']) {
      this.isEdit = true;
      this.invoiceId = +this.route.snapshot.params['id'];
      this.invoiceService.getInvoice(this.invoiceId).subscribe({
        next: (inv) => this.invoice = { ...inv, dueDate: new Date(inv.dueDate) }
      });
    } else {
      this.invoiceService.generateInvoiceNumber().subscribe({
        next: (num) => this.invoice.invoiceNumber = num
      });
    }
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({ next: (res) => this.customers = res.data });
  }

  addLineItem(): void {
    this.invoice.lineItems!.push({ description: '', quantity: 1, unitPrice: 0, total: 0 });
  }

  removeLineItem(index: number): void {
    this.invoice.lineItems!.splice(index, 1);
    this.calculateTotals();
  }

  updateLineItem(index: number): void {
    const item = this.invoice.lineItems![index];
    item.total = item.quantity * item.unitPrice;
    this.calculateTotals();
  }

  calculateTotals(): void {
    this.invoice.subtotal = this.invoice.lineItems!.reduce((sum, item) => sum + item.total, 0);
    this.invoice.taxAmount = this.invoice.subtotal * (this.invoice.taxRate! / 100);
    this.invoice.total = this.invoice.subtotal + this.invoice.taxAmount - (this.invoice.discount || 0);
  }

  isValid(): boolean {
    const items = this.invoice.lineItems || [];
    const subtotal = this.invoice.subtotal || 0;
    const taxRate = this.invoice.taxRate || 0;
    const discount = this.invoice.discount || 0;
    return !!this.invoice.invoiceNumber?.trim() &&
           !!this.invoice.customerId &&
           this.invoice.dueDate instanceof Date && !Number.isNaN(this.invoice.dueDate.getTime()) &&
           items.length > 0 &&
           items.every((item) =>
             !!item.description.trim() &&
             Number.isFinite(item.quantity) && item.quantity > 0 &&
             Number.isFinite(item.unitPrice) && item.unitPrice >= 0
           ) &&
           Number.isFinite(taxRate) && taxRate >= 0 && taxRate <= 100 &&
           Number.isFinite(discount) && discount >= 0 && discount <= subtotal + (subtotal * taxRate / 100);
  }

  saveInvoice(): void {
    if (!this.isValid()) {
      this.error = 'Enter an invoice number, select a customer, and add at least one valid line item.';
      return;
    }

    this.error = '';
    this.saving = true;
    this.invoice.customerName = this.customers.find(
      (customer) => customer.id === this.invoice.customerId
    )?.name || 'Unknown customer';
    const request = this.isEdit
      ? this.invoiceService.updateInvoice(this.invoiceId!, this.invoice)
      : this.invoiceService.createInvoice(this.invoice);

    request.subscribe({
      next: () => this.router.navigate(['/invoices']),
      error: (err) => {
        this.error = 'Error saving invoice: ' + err.message;
        this.saving = false;
      }
    });
  }
}