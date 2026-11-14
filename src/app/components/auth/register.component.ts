import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-icon class="auth-icon">person_add</mat-icon>
          <mat-card-title>Create Account</mat-card-title>
          <mat-card-subtitle>Register for Billing Management</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form #registerForm="ngForm" (ngSubmit)="onSubmit(registerForm)">
            <div class="error-message" *ngIf="error">{{ error }}</div>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput name="name" [(ngModel)]="name" required>
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" name="email" [(ngModel)]="email" required email>
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" name="password" [(ngModel)]="password" required minlength="6">
              <mat-icon matPrefix>lock</mat-icon>
            </mat-form-field>
            <button mat-raised-button color="primary" class="full-width submit-btn"
                    type="submit" [disabled]="loading">
              <mat-spinner diameter="20" *ngIf="loading"></mat-spinner>
              <span *ngIf="!loading">Create Account</span>
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <a mat-button routerLink="/login">Already have an account? Sign in</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { display: flex; justify-content: center; align-items: center; min-height: 100%; padding: 20px; background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 58%, var(--accent-color) 100%); }
    .auth-card { max-width: 420px; width: 100%; padding: 24px; }
    .auth-icon { font-size: 48px; width: 48px; height: 48px; color: var(--primary-color); margin-bottom: 8px; }
    .mat-card-header { flex-direction: column; align-items: center; text-align: center; margin-bottom: 16px; }
    .full-width { width: 100%; margin-bottom: 16px; }
    .submit-btn { height: 48px; font-size: 16px; }
    .error-message { color: #f44336; background: #ffebee; padding: 8px 12px; border-radius: 4px; margin-bottom: 16px; }
    mat-spinner { margin: 0 auto; }
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      this.error = 'Enter your name, a valid email address, and a password of at least 6 characters.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.authService.register({ name: this.name, email: this.email, password: this.password })
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (err) => { this.error = err.message; this.loading = false; }
      });
  }
}