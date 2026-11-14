import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule
  ],
  template: `
    <div class="customer-form">
      <h1>{{ isEdit ? 'Edit' : 'Add' }} Customer</h1>

      <mat-card>
        <mat-card-content>
          <form #customerForm="ngForm" (ngSubmit)="onSubmit(customerForm)">
            <div class="error-message" *ngIf="error">{{ error }}</div>
            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Full Name</mat-label>
                <input matInput name="name" [(ngModel)]="customer.name" required>
                <mat-icon matPrefix>person</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Email</mat-label>
                <input matInput type="email" name="email" [(ngModel)]="customer.email" required email>
                <mat-icon matPrefix>email</mat-icon>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Phone</mat-label>
                <input matInput name="phone" [(ngModel)]="customer.phone" required>
                <mat-icon matPrefix>phone</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>GST Number</mat-label>
                <input matInput name="gstNumber" [(ngModel)]="customer.gstNumber">
                <mat-icon matPrefix>receipt</mat-icon>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Billing Address</mat-label>
              <textarea matInput name="billingAddress" [(ngModel)]="customer.billingAddress" required rows="3"></textarea>
              <mat-icon matPrefix>location_on</mat-icon>
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button routerLink="/customers" type="button">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="saving">
                {{ isEdit ? 'Update' : 'Create' }} Customer
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .customer-form { max-width: 700px; margin: 0 auto; }
    h1 { margin-bottom: 24px; font-size: 28px; font-weight: 400; }
    .form-row { display: flex; gap: 16px; margin-bottom: 16px; }
    .half-width { flex: 1; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }
    .error-message { margin-bottom: 16px; padding: 10px 12px; border-radius: 10px; color: #b42318; background: #fee4e2; }
    @media (max-width: 768px) { .form-row { flex-direction: column; } }
  `]
})
export class CustomerFormComponent implements OnInit {
  isEdit = false;
  customerId?: number;
  customer: Partial<Customer> = {
    name: '', email: '', phone: '', billingAddress: '', gstNumber: ''
  };
  error = '';
  saving = false;

  constructor(
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.route.snapshot.params['id']) {
      this.isEdit = true;
      this.customerId = +this.route.snapshot.params['id'];
      this.customerService.getCustomer(this.customerId).subscribe({
        next: (cust) => this.customer = { ...cust }
      });
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.error = 'Complete the required fields and enter a valid email address.';
      return;
    }

    this.error = '';
    this.saving = true;
    const request = this.isEdit
      ? this.customerService.updateCustomer(this.customerId!, this.customer)
      : this.customerService.createCustomer(this.customer);

    request.subscribe({
      next: () => this.router.navigate(['/customers']),
      error: (err) => {
        this.error = 'Error saving customer: ' + err.message;
        this.saving = false;
      }
    });
  }
}