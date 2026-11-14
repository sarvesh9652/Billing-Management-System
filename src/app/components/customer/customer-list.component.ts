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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatPaginatorModule, MatMenuModule
  ],
  template: `
    <div class="customer-list">
      <div class="header">
        <h1>Customers</h1>
        <button mat-raised-button color="primary" routerLink="/customers/new">
          <mat-icon>person_add</mat-icon> Add Customer
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search customers...</mat-label>
              <input matInput [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Name, email, or phone">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <table mat-table [dataSource]="customers" class="full-width">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let cust">
                <a [routerLink]="['/customers', cust.id, 'edit']" class="customer-link">{{ cust.name }}</a>
              </td>
            </ng-container>
            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let cust">{{ cust.email }}</td>
            </ng-container>
            <ng-container matColumnDef="phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let cust">{{ cust.phone }}</td>
            </ng-container>
            <ng-container matColumnDef="billingAddress">
              <th mat-header-cell *matHeaderCellDef>Billing Address</th>
              <td mat-cell *matCellDef="let cust">{{ cust.billingAddress }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let cust">
                <button mat-icon-button [matMenuTriggerFor]="menu"><mat-icon>more_vert</mat-icon></button>
                <mat-menu #menu="matMenu">
                  <a mat-menu-item [routerLink]="['/customers', cust.id, 'edit']"><mat-icon>edit</mat-icon> Edit</a>
                  <button mat-menu-item (click)="deleteCustomer(cust.id)"><mat-icon color="warn">delete</mat-icon> Delete</button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div class="empty-state" *ngIf="customers.length === 0">
            <mat-icon>people</mat-icon>
            <p>No customers found</p>
            <button mat-stroked-button color="primary" routerLink="/customers/new">Add Customer</button>
          </div>

          <mat-paginator [length]="totalItems" [pageIndex]="pageIndex" [pageSize]="pageSize" [pageSizeOptions]="[5, 10, 25]"
                         (page)="onPageChange($event)" showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .customer-list { max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { margin: 0; font-size: 28px; font-weight: 400; }
    .filters { margin-bottom: 16px; }
    .search-field { width: 100%; max-width: 400px; }
    .full-width { width: 100%; }
    .customer-link { color: #3f51b5; text-decoration: none; font-weight: 500; }
    .customer-link:hover { text-decoration: underline; }
    .empty-state { text-align: center; padding: 60px 20px; color: #999; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    @media (max-width: 768px) { .header { flex-direction: column; gap: 12px; align-items: stretch; } }
  `]
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  totalItems = 0;
  searchTerm = '';
  pageIndex = 0;
  pageSize = 10;
  displayedColumns = ['name', 'email', 'phone', 'billingAddress', 'actions'];

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void { this.loadCustomers(); }

  loadCustomers(): void {
    this.customerService.getCustomers(this.searchTerm, this.pageIndex, this.pageSize)
      .subscribe({ next: (res) => { this.customers = res.data; this.totalItems = res.total; } });
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.loadCustomers();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCustomers();
  }

  deleteCustomer(id: number): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(id).subscribe({ next: () => this.loadCustomers() });
    }
  }
}