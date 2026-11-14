import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { ReportService } from '../../services/report.service';
import { DashboardMetrics } from '../../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatIconModule,
    MatButtonModule, MatTableModule, MatChipsModule
  ],
  template: `
    <div class="dashboard">
      <h1 class="page-title">Dashboard</h1>
      <div class="error-message" *ngIf="metricsError">{{ metricsError }}</div>

      <div class="metrics-grid">
        <mat-card class="metric-card revenue">
          <mat-card-content>
            <div class="metric-icon"><mat-icon>account_balance</mat-icon></div>
            <div class="metric-info">
              <span class="metric-value">\${{ metrics?.totalRevenue?.toLocaleString() || 0 }}</span>
              <span class="metric-label">Total Revenue</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card invoices">
          <mat-card-content>
            <div class="metric-icon"><mat-icon>receipt</mat-icon></div>
            <div class="metric-info">
              <span class="metric-value">{{ metrics?.totalInvoices || 0 }}</span>
              <span class="metric-label">Total Invoices</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card outstanding">
          <mat-card-content>
            <div class="metric-icon"><mat-icon>pending_actions</mat-icon></div>
            <div class="metric-info">
              <span class="metric-value">\${{ metrics?.outstandingPayments?.toLocaleString() || 0 }}</span>
              <span class="metric-label">Outstanding</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="metric-card overdue">
          <mat-card-content>
            <div class="metric-icon"><mat-icon>warning</mat-icon></div>
            <div class="metric-info">
              <span class="metric-value">{{ metrics?.overdueInvoices || 0 }}</span>
              <span class="metric-label">Overdue</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="charts-row">
        <mat-card class="chart-card">
          <mat-card-header><mat-card-title>Revenue Overview</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="revenue-chart" *ngIf="metrics?.monthlyRevenue?.length; else noRevenue">
              <div class="revenue-point" *ngFor="let point of metrics?.monthlyRevenue">
                <span class="bar-value">\${{ point.revenue.toFixed(0) }}</span>
                <div class="bar-track">
                  <div class="revenue-bar" [style.height.%]="barHeight(point.revenue)"></div>
                </div>
                <span class="bar-label">{{ point.month }}</span>
              </div>
            </div>
            <ng-template #noRevenue><p class="chart-empty">Revenue data is not available.</p></ng-template>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header><mat-card-title>Invoice Status</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="status-chart" *ngIf="metrics?.invoiceStatusDistribution?.length">
              <div class="status-row" *ngFor="let item of metrics?.invoiceStatusDistribution">
                <div class="status-label">
                  <span>{{ item.status }}</span><strong>{{ item.count }}</strong>
                </div>
                <div class="status-track">
                  <div class="status-fill"
                       [class.paid]="item.status === 'Paid'"
                       [class.sent]="item.status === 'Sent'"
                       [class.overdue]="item.status === 'Overdue'"
                       [class.draft]="item.status === 'Draft'"
                       [style.width.%]="statusWidth(item.count)"></div>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="recent-card">
        <mat-card-header>
          <mat-card-title>Recent Invoices</mat-card-title>
          <a mat-button color="primary" routerLink="/invoices">View All</a>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="metrics?.recentInvoices || []" class="full-width">
            <ng-container matColumnDef="invoiceNumber">
              <th mat-header-cell *matHeaderCellDef>Invoice #</th>
              <td mat-cell *matCellDef="let inv">{{ inv.invoiceNumber }}</td>
            </ng-container>
            <ng-container matColumnDef="customerName">
              <th mat-header-cell *matHeaderCellDef>Customer</th>
              <td mat-cell *matCellDef="let inv">{{ inv.customerName }}</td>
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
                      [class.draft]="inv.status === 'draft'">
                  {{ inv.status }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="dueDate">
              <th mat-header-cell *matHeaderCellDef>Due Date</th>
              <td mat-cell *matCellDef="let inv">{{ inv.dueDate | date:'mediumDate' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          <div class="empty-state" *ngIf="!metrics?.recentInvoices?.length">
            <p>No invoices yet. <a routerLink="/invoices/new">Create your first invoice</a></p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; margin: 0 auto; }
    .page-title { margin: 0 0 24px; font-size: 28px; font-weight: 400; color: #333; }
    .error-message { margin-bottom: 16px; padding: 10px 12px; border-radius: 10px; color: var(--danger-color); background: #fee4e2; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .metric-card { transition: transform 0.2s; }
    .metric-card:hover { transform: translateY(-2px); }
    .metric-card mat-card-content { display: flex; align-items: center; gap: 20px; padding: 20px; }
    .metric-icon mat-icon { font-size: 48px; width: 48px; height: 48px; }
    .revenue .metric-icon mat-icon { color: var(--success-color); }
    .invoices .metric-icon mat-icon { color: var(--primary-color); }
    .outstanding .metric-icon mat-icon { color: var(--warning-color); }
    .overdue .metric-icon mat-icon { color: var(--danger-color); }
    .metric-info { display: flex; flex-direction: column; }
    .metric-value { font-size: 28px; font-weight: 500; color: #333; }
    .metric-label { font-size: 14px; color: #666; }
    .charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .revenue-chart { min-height: 220px; display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 12px; align-items: end; padding: 16px 4px 0; }
    .revenue-point { min-width: 0; height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 8px; color: var(--text-secondary); font-size: 12px; }
    .bar-value { min-height: 16px; color: var(--text-primary); font-size: 11px; }
    .bar-track { width: min(100%, 34px); height: 140px; display: flex; align-items: flex-end; overflow: hidden; border-radius: 8px 8px 2px 2px; background: var(--surface-alt); }
    .revenue-bar { width: 100%; min-height: 0; border-radius: 8px 8px 2px 2px; background: linear-gradient(180deg, var(--accent-color), var(--primary-color)); transition: height 180ms ease; }
    .bar-label { font-weight: 500; }
    .status-chart { display: grid; gap: 16px; padding: 18px 4px; }
    .status-label { display: flex; justify-content: space-between; margin-bottom: 6px; color: var(--text-secondary); font-size: 13px; }
    .status-label strong { color: var(--text-primary); }
    .status-track { height: 10px; overflow: hidden; border-radius: 999px; background: var(--surface-alt); }
    .status-fill { height: 100%; min-width: 0; border-radius: inherit; background: var(--primary-color); transition: width 180ms ease; }
    .status-fill.paid { background: var(--success-color); }
    .status-fill.sent { background: var(--primary-light); }
    .status-fill.overdue { background: var(--danger-color); }
    .status-fill.draft { background: var(--warning-color); }
    .chart-empty { min-height: 200px; display: grid; place-items: center; color: var(--text-secondary); }
    .recent-card mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    .full-width { width: 100%; }
    .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; text-transform: uppercase; background: #e0e0e0; }
    .status-badge.paid { background: #c8e6c9; color: #2e7d32; }
    .status-badge.overdue { background: #ffcdd2; color: #c62828; }
    .status-badge.draft { background: #fff9c4; color: #f57f17; }
    .empty-state { text-align: center; padding: 40px; color: #999; }
    @media (max-width: 768px) { .metrics-grid { grid-template-columns: repeat(2, 1fr); } .charts-row { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  metrics: DashboardMetrics | null = null;
  metricsError = '';
  displayedColumns = ['invoiceNumber', 'customerName', 'total', 'status', 'dueDate'];

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.reportService.getDashboardMetrics().subscribe({
      next: (data) => this.metrics = data,
      error: (error: unknown) => {
        this.metricsError = error instanceof Error ? error.message : 'Unable to load dashboard metrics.';
      }
    });
  }

  barHeight(value: number): number {
    const peak = Math.max(...(this.metrics?.monthlyRevenue.map((point) => point.revenue) || [0]));
    return peak > 0 && value > 0 ? Math.max(6, (value / peak) * 100) : 0;
  }

  statusWidth(count: number): number {
    const peak = Math.max(...(this.metrics?.invoiceStatusDistribution.map((item) => item.count) || [0]));
    return peak > 0 && count > 0 ? (count / peak) * 100 : 0;
  }
}