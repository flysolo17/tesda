import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import {
  NgbCollapseModule,
  NgbDropdownModule,
  NgbNavModule,
} from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { delay } from 'rxjs';
import { AppointmentStatus } from '../../models/Appointment';

interface NavItems {
  label: string;
  route?: string | string[]; // for top-level links
  icon?: string;
  more?: {
    label: string;
    route: string | string[];
    queryParams?: { [key: string]: any };
  }[];
  open?: boolean;
}
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    NgbNavModule,
    NgbNavModule,
    NgbCollapseModule,
    RouterModule,
    CommonModule,
    RouterOutlet,
    NgbDropdownModule,
  ],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss',
})
export class NavigationComponent {
  navItems: NavItems[] = [
    { label: 'Dashboard', route: 'dashboard', icon: 'bi bi-house' },
    {
      label: 'Appointments',
      icon: 'bi bi-calendar-check-fill',

      more: [
        {
          label: 'Appointments',
          route: 'appointments',
          queryParams: {
            status: AppointmentStatus.PENDING,
          },
        },
        {
          label: 'Schedules',
          route: 'schedules',
        },
      ],
    },
    {
      label: 'Messages',
      icon: 'bi bi-chat-left-text-fill',
      route: 'messages',
    },
    {
      label: 'About',
      icon: 'bi bi-table',
      more: [
        {
          label: 'Manage Banners',
          route: 'banners',
        },
        {
          label: 'Careers',
          route: 'careers',
        },
        {
          label: 'Activities',
          route: 'activities',
        },
        {
          label: 'Organizational Structure',
          route: 'organizational-structure',
        },
      ],
    },
    {
      label: 'Programs & Services',
      icon: 'bi bi-grid',
      more: [
        {
          label: 'Services',
          route: 'services',
        },
        {
          label: 'TVET Providers and Assessment Centers',
          route: 'providers',
        },
      ],
    },
    {
      label: 'Announcements',
      icon: 'bi bi-megaphone-fill',
      route: '/announcements',
      more: [
        {
          label: 'Announcements',
          route: 'announcements',
          queryParams: { type: 'announcement' },
        },
        {
          label: 'News',
          route: 'announcements',
          queryParams: { type: 'news' },
        },
        {
          label: 'Events',
          route: 'announcements',
          queryParams: { type: 'event' },
        },
        {
          label: 'Create Announcement',
          route: 'create-announcement',
        },
      ],
    },
    {
      label: 'Feedback',
      icon: 'bi-chat-dots', // Bootstrap icon for feedback/chat
      route: 'feedback',
    },
    {
      label: 'Survey',
      icon: 'bi-clipboard-check',
      route: 'survey',
    },
    {
      label: 'Transparency',
      icon: '',
      more: [
        {
          label: 'Transparency Seal',
          route: 'transparency-seal',
        },
        {
          label: 'PHILGEPS Posting',
          route: 'philgeps-posting',
        },
      ],
    },
  ];

  toggle(item: NavItems) {
    if (item.more) item.open = !item.open;
  }
  users$ = this.authService.getCurrentUser();
  constructor(
    public activatedRoute: ActivatedRoute,
    private route: Router,
    private authService: AuthService
  ) {}

  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService
          .logout()
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Logged Out',
              text: 'You have been successfully logged out.',
            });
            delay(1000);
            this.route.navigate(['']);
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Logout Failed',
              text: error?.message || 'Something went wrong. Please try again.',
            });
          });
      }
    });
  }
}
