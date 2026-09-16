import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthStateService } from './auth-state.service';
import { Observable, tap } from 'rxjs';

export interface NotificationItem {
  id: number;
  message: string;
  isRead?: boolean;
  read?: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationStateService {
  private readonly API = `${environment.apiUrl}/notifications`;

  public notifications = signal<NotificationItem[]>([]);
  public unreadCount = signal<number>(0);
  public loading = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private authState: AuthStateService
  ) {
    this.authState.session$.subscribe(session => {
      if (!session.token) {
        this.clearState();
      }
    });
  }

  public loadNotifications(): Observable<NotificationItem[]> {
    if (!this.authState.isAuthenticated()) {
      this.clearState();
      return new Observable(sub => { sub.next([]); sub.complete(); });
    }

    this.loading.set(true);
    return this.http.get<NotificationItem[]>(this.API).pipe(
      tap({
        next: (items) => {
          const list = (items || []).map(n => ({
            ...n,
            isRead: n.isRead === true || n.read === true
          }));
          this.notifications.set(list);
          const unread = list.filter(i => !i.isRead).length;
          this.unreadCount.set(unread);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      })
    );
  }

  public markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}/read`, {}).pipe(
      tap(() => {
        this.notifications.update(list =>
          list.map(n => n.id === id ? { ...n, isRead: true, read: true } : n)
        );
        this.recalculateUnread();
      })
    );
  }

  public markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.API}/read-all`, {}).pipe(
      tap(() => {
        this.notifications.update(list =>
          list.map(n => ({ ...n, isRead: true, read: true }))
        );
        this.unreadCount.set(0);
      })
    );
  }

  private recalculateUnread(): void {
    const unread = this.notifications().filter(n => !(n.isRead || n.read)).length;
    this.unreadCount.set(unread);
  }

  public clearState(): void {
    this.notifications.set([]);
    this.unreadCount.set(0);
    this.loading.set(false);
  }
}
