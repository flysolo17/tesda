import { Component, inject, OnDestroy, OnInit } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  combineLatest,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
} from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';
import { User, UserType } from '../../models/Users';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  MessagingService,
  UnSeenMessages,
} from '../../services/messaging.service';
import { Message } from '../../models/Message';
import { FeedbackDialogComponent } from '../feedback-dialog/feedback-dialog.component';
import { FeedbackService } from '../../services/feedback.service';
import { ForgotPasswordDialogComponent } from '../forgot-password-dialog/forgot-password-dialog.component';
import Swal from 'sweetalert2';
import { NotificationService } from '../../services/notification.service';
import { Notification } from '../../models/Notification';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [ToolbarComponent, CommonModule, RouterOutlet],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  title = 'tesda';

  private modalService = inject(NgbModal);
  private router = inject(Router);
  private authService = inject(AuthService);
  private messageService = inject(MessagingService);
  private feedbackService = inject(FeedbackService);
  private notificationService = inject(NotificationService);

  // Use signal or BehaviorSubject if you want reactive loading
  loading = false;

  readonly user$ = this.authService.getCurrentUser();

  /** Unseen grouped messages per sender */
  readonly unseenMessages$: Observable<UnSeenMessages[]> = this.user$.pipe(
    switchMap((user) =>
      user?.id ? this.messageService.getGroupedUnseenMessages(user.id) : of([])
    )
  );

  readonly notifications$: Observable<Notification[]> = this.user$.pipe(
    switchMap((user) =>
      user?.id
        ? this.notificationService.getAllUserNotification(user.id)
        : of([])
    )
  );

  register(): void {
    this.modalService.open(RegisterDialogComponent);
  }

  async login(): Promise<void> {
    const modalRef = this.modalService.open(LoginDialogComponent);
    try {
      const uid = await modalRef.result;
      if (uid === 'register') {
        this.register();
      } else if (uid === 'forgotPassword') {
        this.openForgotPasswordDialog();
      } else {
        const shouldPrompt = !(await this.feedbackService.hasFeedback(uid));
        if (shouldPrompt) {
          this.openFeedbackDialog();
        }
      }
    } catch {
      // Modal dismissed
    }
  }

  openForgotPasswordDialog(): void {
    this.modalService.open(ForgotPasswordDialogComponent);
  }

  async logout(): Promise<void> {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    });

    if (result.isConfirmed) {
      this.loading = true;
      try {
        await this.authService.logout();
        await Swal.fire({
          icon: 'success',
          title: 'Logged out',
          text: 'You have been successfully logged out.',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch {
        await Swal.fire({
          icon: 'error',
          title: 'Logout failed',
          text: 'Something went wrong while logging out.',
        });
      } finally {
        this.loading = false;
      }
    }
  }

  navigateToDashboard(type: UserType | null): void {
    const path = type === UserType.ADMIN ? '/administration/main' : '/main';
    this.router.navigate([path]);
  }

  openFeedbackDialog(): void {
    this.modalService.open(FeedbackDialogComponent, { size: 'lg' });
  }
}
