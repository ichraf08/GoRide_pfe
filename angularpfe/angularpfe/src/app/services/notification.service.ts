import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Observable } from 'rxjs';
import { switchMap, tap, startWith } from 'rxjs/operators';
import { Notification } from '../models/notification.model';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly API_URL = 'http://localhost:8081/api/notifications';
  
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    // Polling toutes les 30 secondes si l'utilisateur est connecté
    interval(30000).pipe(
      startWith(0),
      switchMap(() => {
        if (this.authService.isLoggedIn()) {
          return this.fetchNotifications();
        }
        return [];
      })
    ).subscribe();
  }

  fetchNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.API_URL).pipe(
      tap(notifications => {
        this.notificationsSubject.next(notifications);
        const unreadCount = notifications.filter(n => !n.isRead).length;
        this.unreadCountSubject.next(unreadCount);
      })
    );
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.API_URL}/${id}/read`, {}).pipe(
      tap(() => this.fetchNotifications().subscribe())
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.API_URL}/read-all`, {}).pipe(
      tap(() => this.fetchNotifications().subscribe())
    );
  }
}
