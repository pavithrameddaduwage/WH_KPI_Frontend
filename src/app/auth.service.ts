// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly USERNAME_KEY = 'username';

  private usernameSubject = new BehaviorSubject<string | null>(this.getStoredUsername());
  username$ = this.usernameSubject.asObservable();

  constructor() {}

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    const username = this.extractUsernameFromToken(token);
    if (username) {
      this.setUsername(username);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    this.usernameSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setUsername(username: string): void {
    localStorage.setItem(this.USERNAME_KEY, username);
    this.usernameSubject.next(username);
  }

  getUsername(): string | null {
    return this.usernameSubject.value;
  }

  private getStoredUsername(): string | null {
    const token = this.getToken();
    if (!token) return localStorage.getItem(this.USERNAME_KEY);

    const username = this.extractUsernameFromToken(token);
    return username || localStorage.getItem(this.USERNAME_KEY);
  }

  private extractUsernameFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.username || payload?.email || null;
    } catch {
      return null;
    }
  }
}
