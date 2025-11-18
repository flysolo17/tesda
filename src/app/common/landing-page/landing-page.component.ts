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
  loading$ = false;

  readonly user$ = this.authService.getCurrentUser();

  /** Unseen grouped messages per sender */
  readonly unseenMessages$ = this.user$.pipe(
    switchMap((user) =>
      user?.id
        ? this.messageService.getGroupedUnseenMessages(user.id)
        : of([] as UnSeenMessages[])
    )
  );

  register() {
    const modalRef = this.modalService.open(RegisterDialogComponent);
  }
  login() {
    const modalRef = this.modalService.open(LoginDialogComponent);
    modalRef.result.then(async (uid) => {
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
    });
  }

  openForgotPasswordDialog() {
    this.modalService.open(ForgotPasswordDialogComponent);
  }
  logout(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading$ = true;
        this.authService
          .logout()
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Logged out',
              text: 'You have been successfully logged out.',
              timer: 2000,
              showConfirmButton: false,
            });
          })
          .catch(() => {
            Swal.fire({
              icon: 'error',
              title: 'Logout failed',
              text: 'Something went wrong while logging out.',
            });
          })
          .finally(() => {
            this.loading$ = false;
          });
      }
    });
  }

  navigateToDashboard(type: UserType | null) {
    if (type === UserType.ADMIN) {
      this.router.navigate(['/administration/main']);
    } else {
      this.router.navigate(['/main']);
    }
  }

  openFeedbackDialog() {
    this.modalService.open(FeedbackDialogComponent, { size: 'lg' });
  }
}
