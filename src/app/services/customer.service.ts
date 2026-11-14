import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Customer } from '../models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly storageKey = 'bms_customers';

  constructor() {
    this.seedCustomers();
  }

  getCustomers(search?: string, page = 0, limit = 20): Observable<{ data: Customer[]; total: number }> {
    return of(this.getAllCustomers()).pipe(
      map((customers) => {
        const term = search?.trim().toLowerCase();
        const filtered = !term
          ? customers
          : customers.filter((customer) =>
              [customer.name, customer.email, customer.phone, customer.billingAddress]
                .join(' ')
                .toLowerCase()
                .includes(term)
            );

        const start = page * limit;
        return {
          data: filtered.slice(start, start + limit),
          total: filtered.length
        };
      })
    );
  }

  getCustomer(id: number): Observable<Customer> {
    return of(this.getAllCustomers()).pipe(
      map((customers) => customers.find((customer) => customer.id === id) as Customer)
    );
  }

  createCustomer(customer: Partial<Customer>): Observable<Customer> {
    return of(null).pipe(
      map(() => {
        const customers = this.getAllCustomers();
        const newCustomer: Customer = {
          id: Date.now(),
          name: customer.name || 'New Customer',
          email: customer.email || 'customer@example.com',
          phone: customer.phone || 'N/A',
          billingAddress: customer.billingAddress || 'Not provided',
          gstNumber: customer.gstNumber || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        customers.unshift(newCustomer);
        this.saveCustomers(customers);
        return newCustomer;
      })
    );
  }

  updateCustomer(id: number, customer: Partial<Customer>): Observable<Customer> {
    return of(null).pipe(
      map(() => {
        const customers = this.getAllCustomers();
        const index = customers.findIndex((item) => item.id === id);

        if (index === -1) {
          throw new Error('Customer not found.');
        }

        const updatedCustomer: Customer = {
          ...customers[index],
          ...customer,
          updatedAt: new Date()
        };

        customers[index] = updatedCustomer;
        this.saveCustomers(customers);
        return updatedCustomer;
      })
    );
  }

  deleteCustomer(id: number): Observable<void> {
    return of(null).pipe(
      map(() => {
        const customers = this.getAllCustomers().filter((customer) => customer.id !== id);
        this.saveCustomers(customers);
      })
    );
  }

  private seedCustomers(): void {
    if (localStorage.getItem(this.storageKey)) {
      return;
    }

    const defaultCustomers: Customer[] = [
      {
        id: 1,
        name: 'Apex Labs',
        email: 'billing@apexlabs.com',
        phone: '+1 (415) 222-1122',
        billingAddress: '550 Market Street, San Francisco, CA',
        gstNumber: 'GST-APX-1188',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Northwind Retail',
        email: 'accounts@northwindretail.com',
        phone: '+1 (212) 555-0199',
        billingAddress: '102 Fifth Avenue, New York, NY',
        gstNumber: 'GST-NWR-4420',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Harbor Studio',
        email: 'finance@harborstudio.io',
        phone: '+1 (310) 778-0031',
        billingAddress: '89 Ocean Drive, Los Angeles, CA',
        gstNumber: 'GST-HRB-9311',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.saveCustomers(defaultCustomers);
  }

  private getAllCustomers(): Customer[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as Customer[];
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }

  private saveCustomers(customers: Customer[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(customers));
  }
}