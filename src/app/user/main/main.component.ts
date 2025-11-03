import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import {
  NgbNavModule,
  NgbCollapseModule,
  NgbDropdownModule,
} from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import {
  MessagingService,
  UnSeenMessages,
} from '../../services/messaging.service';
import { switchMap, of, Observable, map } from 'rxjs';
import { MainStateService } from '../main-state.service';

export interface UserNavItems {
  label: string;
  route: string;
  icon: string;
  badgeCount?: number;
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    RouterOutlet,
    NgbNavModule,
    NgbNavModule,
    NgbCollapseModule,
    RouterModule,
    CommonModule,
    RouterOutlet,
    NgbDropdownModule,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  private authService = inject(AuthService);
  private messageService = inject(MessagingService);
  items$: UserNavItems[] = [
    {
      label: 'Dashboard',
      route: 'dashboard',
      icon: 'bi bi-speedometer2',
    },
    {
      label: 'Messages',
      route: 'messages',
      icon: 'bi bi-chat-dots',
    },
  ];
  private state = inject(MainStateService);
  readonly user$ = this.state.user$;
  readonly unseenMessages$ = this.state.conversation$;

  unseen = this.state.unseen$;
}
