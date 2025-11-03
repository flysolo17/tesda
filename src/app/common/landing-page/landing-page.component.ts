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
  }
  logout() {
    this.loading$ = true;
    this.authService
      .logout()
      .then(() => {})
      .finally(() => (this.loading$ = false));
  }
  navigateToDashboard(type: UserType | null) {
    if (type === UserType.ADMIN) {
      this.router.navigate(['/administration/main']);
    } else {
      this.router.navigate(['/main']);
    }
  }
}
