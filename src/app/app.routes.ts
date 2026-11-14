import { Routes } from '@angular/router';
import { AuthGuard, LoginGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent),
    canActivate: [LoginGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register.component').then(m => m.RegisterComponent),
    canActivate: [LoginGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'invoices',
    loadComponent: () => import('./components/invoice/invoice-list.component').then(m => m.InvoiceListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'invoices/new',
    loadComponent: () => import('./components/invoice/invoice-form.component').then(m => m.InvoiceFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'invoices/:id/edit',
    loadComponent: () => import('./components/invoice/invoice-form.component').then(m => m.InvoiceFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'invoices/:id',
    loadComponent: () => import('./components/invoice/invoice-detail.component').then(m => m.InvoiceDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'customers',
    loadComponent: () => import('./components/customer/customer-list.component').then(m => m.CustomerListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'customers/new',
    loadComponent: () => import('./components/customer/customer-form.component').then(m => m.CustomerFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'customers/:id/edit',
    loadComponent: () => import('./components/customer/customer-form.component').then(m => m.CustomerFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
