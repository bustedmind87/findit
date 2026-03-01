import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  email: string;
}

const USERS_KEY = 'fi_users';
const CURRENT_USER_KEY = 'currentUser';

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
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  private getAllUsers(): User[] {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  private saveAllUsers(list: User[]) {
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
  }

  register(username: string, email: string, password: string): { success: boolean; message?: string } {
    // basic checks
    if (!username || !email || !password) return { success: false, message: 'All fields required' };
    const users = this.getAllUsers();
    if (users.find(u => u.username === username || u.email === email)) {
      return { success: false, message: 'Username or email already exists' };
    }
    const id = String(Date.now());
    const user: User = { id, username, role: 'user', email };
    users.push(user);
    this.saveAllUsers(users);
    // store credential mapping (simple demo): keep passwords in localStorage under a map
    const credsRaw = localStorage.getItem('fi_creds') || '{}';
    const creds = JSON.parse(credsRaw);
    creds[username] = password;
    localStorage.setItem('fi_creds', JSON.stringify(creds));
    // auto-login after register
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    return { success: true };
  }

  login(username: string, password: string): boolean {
    // admin demo
    if (username === this.DEMO_ADMIN.username && password === this.DEMO_ADMIN.password) {
      const user: User = {
        id: '1',
        username: 'admin',
        role: 'admin',
        email: 'admin@eastbrunswick.edu'
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      this.currentUserSubject.next(user);
      return true;
    }

    const credsRaw = localStorage.getItem('fi_creds') || '{}';
    const creds = JSON.parse(credsRaw);
    if (creds[username] && creds[username] === password) {
      const users = this.getAllUsers();
      const user = users.find(u => u.username === username) || null;
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
        return true;
      }
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
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
