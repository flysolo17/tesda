import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User, UserType } from '../../models/Users';
import { RouterLink, RouterModule } from '@angular/router';
import { UnSeenMessages } from '../../services/messaging.service';
import { dropdowns, verificationLinks } from './links';

export interface ToolbarNavItem {
  label: string;
  link: string;
}
@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {

  dropdowns$ = dropdowns
  verificationLinks$ = verificationLinks;
  /** Authenticated user (if any) */
  @Input({ required: true }) user: User | null = null;

  /** Grouped unseen messages from backend */
  @Input({ required: false }) messages: UnSeenMessages[] = [];

  /** Emitted when user clicks "Register" */
  @Output() readonly onRegister = new EventEmitter<void>();

  /** Emitted when user clicks "Login" */
  @Output() readonly onLogin = new EventEmitter<void>();

  /** Emitted when user clicks "Logout" */
  @Output() readonly onLogout = new EventEmitter<void>();

  /** Emitted when user navigates to dashboard */
  @Output() readonly onNavigateToDashboard =
    new EventEmitter<UserType | null>();

  get unseenMessagesCount(): number {
    return this.messages.reduce((total, group) => total + group.count, 0);
  }
  registerClicked() {
    this.onRegister.emit();
  }

  loginClicked() {
    this.onLogin.emit();
  }
  logout() {
    this.onLogout.emit();
  }
  navigate(type: UserType | null) {
    this.onNavigateToDashboard.emit(type);
  }
}
