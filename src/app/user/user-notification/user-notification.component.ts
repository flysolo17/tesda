import { Component } from '@angular/core';
import { Notification, NotificationType } from '../../models/Notification';
import { CommonModule } from '@angular/common';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { map, Observable, of, switchMap } from 'rxjs';
import { User } from '../../models/Users';

@Component({
  selector: 'app-user-notification',
  standalone: true,
  imports: [CommonModule, NgbNavModule],
  templateUrl: './user-notification.component.html',
  styleUrl: './user-notification.component.scss',
})
export class UserNotificationComponent {
  types$ = Object.values(NotificationType);

  // Observable for the current user
  user$: Observable<User | null> = this.authService.getCurrentUser();

  // Observable for notifications, dependent on user$
  notifications$: Observable<Notification[]> = this.user$.pipe(
    switchMap((user) => {
      if (!user?.id) {
        return of([]);
      }
      return this.notificationService.getAllUserNotification(user.id);
    })
  );

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  getUserNotificationByType(
    type: NotificationType | 'All'
  ): Observable<Notification[]> {
    return this.notifications$.pipe(
      map((notifications) => {
        if (type === 'All') {
          return notifications;
        }
        return notifications.filter((n) => n.type === type);
      })
    );
  }
}
