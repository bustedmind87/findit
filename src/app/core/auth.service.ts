import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  // Demo admin credentials
  private readonly DEMO_ADMIN = {
    username: 'admin',
    password: 'admin123'
  };

  constructor() {}

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  login(username: string, password: string): boolean {
    if (username === this.DEMO_ADMIN.username && password === this.DEMO_ADMIN.password) {
      const user: User = {
        id: '1',
        username: 'admin',
        role: 'admin',
        email: 'admin@eastbrunswick.edu'
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }
}
