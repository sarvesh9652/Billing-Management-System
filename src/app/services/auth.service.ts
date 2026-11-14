import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'bms_token';
  private userKey = 'bms_user';
  private usersKey = 'bms_users';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    this.seedDemoUser();
    this.loadStoredUser();
  }

  private seedDemoUser(): void {
    const users = this.getStoredUsers();
    if (users.length === 0) {
      const demoUser: User = {
        id: 1,
        name: 'Demo User',
        email: 'demo@billing.app',
        password: 'demo123',
        createdAt: new Date()
      };
      localStorage.setItem(this.usersKey, JSON.stringify([demoUser]));
    }
  }

  private getStoredUsers(): User[] {
    const raw = localStorage.getItem(this.usersKey);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as User[];
    } catch {
      localStorage.removeItem(this.usersKey);
      return [];
    }
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  private loadStoredUser(): void {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUserSubject.next(user);
      } catch {
        this.clearStorage();
      }
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const parts = token.split('.');
      if (parts.length < 2) return false;
      const payload = JSON.parse(this.base64UrlDecode(parts[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return of(null).pipe(
      delay(250),
      map(() => {
        const users = this.getStoredUsers();
        const matchedUser = users.find(
          (user) => user.email.toLowerCase() === credentials.email.toLowerCase() && user.password === credentials.password
        );

        if (!matchedUser) {
          throw new Error('Invalid email or password.');
        }

        const safeUser: User = {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          createdAt: matchedUser.createdAt
        };

        const token = this.createToken(safeUser);
        this.handleAuthResponse({ token, user: safeUser });
        return { token, user: safeUser };
      }),
      catchError((error: Error) => throwError(() => new Error(error.message || 'Unable to login.')))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return of(null).pipe(
      delay(250),
      map(() => {
        const users = this.getStoredUsers();
        const exists = users.some((user) => user.email.toLowerCase() === data.email.toLowerCase());

        if (exists) {
          throw new Error('An account with this email already exists.');
        }

        const newUser: User = {
          id: Date.now(),
          name: data.name,
          email: data.email,
          password: data.password,
          createdAt: new Date()
        };

        users.push(newUser);
        this.saveUsers(users);

        const safeUser: User = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt
        };

        const token = this.createToken(safeUser);
        this.handleAuthResponse({ token, user: safeUser });
        return { token, user: safeUser };
      }),
      catchError((error: Error) => throwError(() => new Error(error.message || 'Unable to register.')))
    );
  }

  logout(): void {
    this.clearStorage();
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  private handleAuthResponse(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.userKey, JSON.stringify(res.user));
    this.currentUserSubject.next(res.user);
  }

  private clearStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  private createToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    };

    const header = this.base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const body = this.base64UrlEncode(JSON.stringify(payload));
    return `${header}.${body}.offline`;
  }

  private base64UrlEncode(value: string): string {
    return btoa(value)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  private base64UrlDecode(value: string): string {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return atob(padded);
  }
}