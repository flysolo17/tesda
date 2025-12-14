import { Component, OnInit } from '@angular/core';
import { Notification, NotificationType } from '../../models/Notification';
import { CommonModule } from '@angular/common';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import { User } from '../../models/Users';
import { er } from '@fullcalendar/core/internal-common';
import { RouterLink } from '@angular/router';
import { uid } from 'chart.js/dist/helpers/helpers.core';
import { doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-user-notification',
  standalone: true,
  imports: [CommonModule, NgbNavModule, RouterLink],
  templateUrl: './user-notification.component.html',
  styleUrl: './user-notification.component.scss',
})
export class UserNotificationComponent implements OnInit {
  types$ = Object.values(NotificationType);

  user$: Observable<User | null> = this.authService.getCurrentUser();
  notifications: Notification[] = [];
  user: User | null = null;
  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user$
      .pipe(
        switchMap((user) => {
          this.user = user;
          if (!user?.id) {
            return of([]);
          }
          return this.notificationService.getAllUserNotification(user.id);
        }),
        catchError((err) => {
          console.error('Notification error:', err);
          return of([]);
        })
      )
      .subscribe((notifications) => {
        this.notifications = notifications;
      });
  }

  getUserNotificationByType(type: NotificationType | 'All'): Notification[] {
    if (type === 'All') {
      return this.notifications;
    }
    return this.notifications.filter((n) => n.type === type);
  }
  isSeen(notification: Notification): boolean {
    return notification.seen.includes(this.user?.id ?? '19');
  }
  markAllRead(uid: string) {
    const unseen = this.notifications
      .filter((n) => !n.seen.includes(uid))
      .map((e) => e.id);

    this.notificationService.markAsSeen(unseen);
  }
  hasUnSeenNotification(uid: string): boolean {
    return this.notifications.some((n) => !n.seen.includes(uid));
  }
}
