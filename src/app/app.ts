import { Component, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatToolbarModule, MatButtonModule,
    MatSidenavModule, MatIconModule, MatListModule, MatTooltipModule
  ],
  template: `
    <mat-toolbar color="primary" class="app-toolbar">
          <button mat-icon-button (click)="toggleSidenav()" *ngIf="authService.isLoggedIn()">
        <mat-icon>menu</mat-icon>
      </button>
      <span class="app-title">Billing Management System</span>
      <span class="spacer"></span>
      <ng-container *ngIf="authService.currentUser$ | async as user">
        <span class="user-info">{{ user.name }}</span>
        <button mat-icon-button (click)="authService.logout()" matTooltip="Logout">
          <mat-icon>logout</mat-icon>
        </button>
      </ng-container>
    </mat-toolbar>

    <mat-drawer-container class="app-container" *ngIf="authService.isLoggedIn()">
          <mat-drawer #drawer mode="side" opened class="app-sidenav" [autoFocus]="false" [disableClose]="true">
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/invoices" routerLinkActive="active-link">
            <mat-icon matListItemIcon>receipt</mat-icon>
            <span matListItemTitle>Invoices</span>
          </a>
          <a mat-list-item routerLink="/customers" routerLinkActive="active-link">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Customers</span>
          </a>
          <a mat-list-item routerLink="/reports" routerLinkActive="active-link">
            <mat-icon matListItemIcon>bar_chart</mat-icon>
            <span matListItemTitle>Reports</span>
          </a>
        </mat-nav-list>
      </mat-drawer>
      <mat-drawer-content class="app-content">
        <router-outlet></router-outlet>
      </mat-drawer-content>
    </mat-drawer-container>

    <div class="full-page" *ngIf="!(authService.isLoggedIn())">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--background-color);
    }

    .app-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      box-shadow: 0 8px 20px rgba(63, 81, 181, 0.18);
    }

    .app-title {
      margin-left: 8px;
      font-weight: 600;
      letter-spacing: 0.02em;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-info {
      margin-right: 12px;
      font-size: 14px;
      opacity: 0.9;
    }

    .app-container {
      flex: 1;
      min-height: calc(100vh - 64px);
      background: transparent;
    }

    .app-sidenav {
      width: 250px;
      padding-top: 8px;
      border-right: 1px solid var(--divider-color);
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(4px);
    }

    .app-content {
      padding: 24px;
      background: transparent;
      min-height: 100%;
    }

    .full-page {
      min-height: calc(100vh - 64px);
      background: transparent;
    }

    .active-link {
      background: var(--primary-soft);
      border-radius: 12px;
      color: var(--primary-color);
    }

    .active-link mat-icon {
      color: var(--primary-color);
    }

    @media (max-width: 768px) {
      .app-sidenav {
        width: 210px;
      }

      .app-content {
        padding: 16px;
      }
    }
  `]
})
export class App {
  @ViewChild('drawer') drawer!: MatDrawer;

  constructor(public authService: AuthService) {}

  toggleSidenav(): void {
    this.drawer?.toggle();
  }
}
