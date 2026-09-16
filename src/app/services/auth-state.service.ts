import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface UserSession {
  token: string | null;
  role: string | null;
  nickname: string | null;
  companyName: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private initialSession: UserSession = {
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    nickname: localStorage.getItem('nickname'),
    companyName: localStorage.getItem('companyName')
  };

  private sessionSubject = new BehaviorSubject<UserSession>(this.initialSession);
  public session$: Observable<UserSession> = this.sessionSubject.asObservable();
  public currentUserSignal = signal<UserSession>(this.initialSession);

  constructor(private router: Router) {}

  public setSession(authData: { token: string; role: string; name: string; organizationName: string }): void {
    localStorage.setItem('token', authData.token);
    localStorage.setItem('role', authData.role);
    localStorage.setItem('nickname', authData.name);
    localStorage.setItem('companyName', authData.organizationName || '');

    const newSession: UserSession = {
      token: authData.token,
      role: authData.role,
      nickname: authData.name,
      companyName: authData.organizationName || ''
    };

    this.sessionSubject.next(newSession);
    this.currentUserSignal.set(newSession);
  }

  public getToken(): string | null {
    return localStorage.getItem('token');
  }

  public getRole(): string | null {
    return localStorage.getItem('role');
  }

  public getNickname(): string | null {
    return localStorage.getItem('nickname') || 'User';
  }

  public getCompanyName(): string | null {
    return localStorage.getItem('companyName') || '';
  }

  public getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return decoded.id ? Number(decoded.id) : (decoded.userId ? Number(decoded.userId) : null);
    } catch {
      return null;
    }
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && token.trim().length > 0;
  }

  public isOwner(): boolean {
    return this.getRole() === 'OWNER';
  }

  public isAdmin(): boolean {
    const role = this.getRole();
    return role === 'ADMIN' || role === 'OWNER';
  }

  public isStrictAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  public isMember(): boolean {
    return this.getRole() === 'MEMBER';
  }

  public logout(): void {
    localStorage.clear();
    const emptySession: UserSession = {
      token: null,
      role: null,
      nickname: null,
      companyName: null
    };

    this.sessionSubject.next(emptySession);
    this.currentUserSignal.set(emptySession);
    this.router.navigate(['/login']);
  }
}
