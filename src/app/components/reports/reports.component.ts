import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportService } from '../../services/report.service';
import { ReportFilter } from '../../models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatTableModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="reports">
      <h1>Reports & Analytics</h1>
      <div class="error-message" *ngIf="exportError">{{ exportError }}</div>

      <mat-card class="filter-card">
        <mat-card-header><mat-card-title>Filter Options</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline" class="date-field">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" [(ngModel)]="filter.startDate">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline" class="date-field">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" [(ngModel)]="filter.endDate">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>
            <mat-form-field appearance="outline" class="status-field">
              <mat-label>Invoice Status</mat-label>
              <mat-select [(ngModel)]="filter.status">
                <mat-option value="">All</mat-option>
                <mat-option value="draft">Draft</mat-option>
                <mat-option value="sent">Sent</mat-option>
                <mat-option value="paid">Paid</mat-option>
                <mat-option value="overdue">Overdue</mat-option>
                <mat-option value="cancelled">Cancelled</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="report-cards">
        <mat-card class="report-card">
          <mat-card-header>
            <mat-card-title>Revenue Report</mat-card-title>
            <mat-card-subtitle>Total revenue with breakdown by period</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="report-actions">
              <button mat-raised-button color="primary" (click)="exportReport('pdf', 'revenue')" [disabled]="loading">
                <mat-icon>picture_as_pdf</mat-icon> Export PDF
              </button>
              <button mat-raised-button color="accent" (click)="exportReport('csv', 'revenue')" [disabled]="loading">
                <mat-icon>table_chart</mat-icon> Export CSV
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="report-card">
          <mat-card-header>
            <mat-card-title>Outstanding Invoices</mat-card-title>
            <mat-card-subtitle>Unpaid and overdue invoices report</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="report-actions">
              <button mat-raised-button color="primary" (click)="exportReport('pdf', 'outstanding')" [disabled]="loading">
                <mat-icon>picture_as_pdf</mat-icon> Export PDF
              </button>
              <button mat-raised-button color="accent" (click)="exportReport('csv', 'outstanding')" [disabled]="loading">
                <mat-icon>table_chart</mat-icon> Export CSV
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="report-card">
          <mat-card-header>
            <mat-card-title>Customer Payment History</mat-card-title>
            <mat-card-subtitle>Payment history per customer</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="report-actions">
              <button mat-raised-button color="primary" (click)="exportReport('pdf', 'customer-history')" [disabled]="loading">
                <mat-icon>picture_as_pdf</mat-icon> Export PDF
              </button>
              <button mat-raised-button color="accent" (click)="exportReport('csv', 'customer-history')" [disabled]="loading">
                <mat-icon>table_chart</mat-icon> Export CSV
              </button>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="report-card">
          <mat-card-header>
            <mat-card-title>Invoice Summary</mat-card-title>
            <mat-card-subtitle>Complete invoice listing with totals</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="report-actions">
              <button mat-raised-button color="primary" (click)="exportReport('pdf', 'invoice-summary')" [disabled]="loading">
                <mat-icon>picture_as_pdf</mat-icon> Export PDF
              </button>
              <button mat-raised-button color="accent" (click)="exportReport('csv', 'invoice-summary')" [disabled]="loading">
                <mat-icon>table_chart</mat-icon> Export CSV
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card *ngIf="previewData.length > 0" class="preview-card">
        <mat-card-header>
          <mat-card-title>Preview: {{ previewTitle }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="previewData" class="full-width">
              <ng-container *ngFor="let col of previewColumns" [matColumnDef]="col">
                <th mat-header-cell *matHeaderCellDef>{{ col }}</th>
                <td mat-cell *matCellDef="let row">{{ row[col] }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="previewColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: previewColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .reports {
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      margin: 0 0 24px;
      font-size: clamp(1.9rem, 3vw, 2.6rem);
      font-weight: 500;
    }

    .filter-card {
      margin-bottom: 24px;
      border-radius: 20px !important;
    }

    .filter-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .date-field,
    .status-field {
      width: min(100%, 220px);
    }

    .report-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .report-card {
      border-radius: 18px !important;
    }

    .report-card mat-card-header {
      margin-bottom: 16px;
    }

    .report-actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .preview-card {
      margin-top: 24px;
      border-radius: 20px !important;
    }

    .error-message {
      margin-bottom: 16px;
      padding: 10px 12px;
      border-radius: 10px;
      color: #b42318;
      background: #fee4e2;
    }

    .table-container {
      overflow-x: auto;
    }

    .full-width {
      width: 100%;
    }

    @media (max-width: 768px) {
      .filter-row {
        flex-direction: column;
      }

      .date-field,
      .status-field {
        width: 100%;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  filter: ReportFilter = {
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date()
  };
  loading = false;
  exportError = '';
  previewData: any[] = [];
  previewColumns: string[] = [];
  previewTitle = '';

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {}

  exportReport(format: 'pdf' | 'csv', type: string): void {
    this.loading = true;
    this.exportError = '';
    this.reportService.exportReport(format, type, this.filter).subscribe({
      next: (blob) => {
        const filename = `${type}-${new Date().toISOString().split('T')[0]}.${format}`;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        this.loading = false;
      },
      error: (error: unknown) => {
        this.exportError = error instanceof Error
          ? `Unable to export report: ${error.message}`
          : 'Unable to export report.';
        this.loading = false;
      }
    });
  }
}