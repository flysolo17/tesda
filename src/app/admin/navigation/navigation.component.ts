import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { collection, doc, Firestore } from '@angular/fire/firestore';

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
  firestore = inject(Firestore);
  navItems: NavItems[] = [
    { label: 'Dashboard', route: 'dashboard', icon: 'bi bi-box-fill' },
    {
      label: 'Appointments',
      icon: 'bi bi-calendar-check-fill',
      route: 'appointments',
    },
    {
      label: 'Messages',
      icon: 'bi bi-chat-left-text-fill',
      route: 'messages',
    },
    {
      label: 'Homepage',
      icon: 'bi bi-house-fill',
      more: [
        {
          label: 'Manage Banners',
          route: 'banners',
        },
        {
          label: 'Manage Announcements',
          route: 'announcements',
        },
        {
          label: 'News and Events',
          route: 'news-and-events',
        },
        {
          label: 'Calendar of Activities',
          route: 'activities',
        },
      ],
    },
    {
      label: 'About',
      icon: 'bi bi-info-circle-fill',
      more: [
        {
          label: `PD's Corner`,
          route: 'careers',
        },
        {
          label: `Organizational Chart`,
          route: 'careers',
        },
        {
          label: 'Careers',
          route: 'careers',
        },
      ],
    },
    {
      label: 'Programs & Services',
      icon: 'bi bi-grid',
      more: [
        {
          label: 'TVET Providers and Assessment Centers',
          route: 'providers',
        },
        {
          label: 'Provincial Office and External Services',
          route: 'services',
        },
      ],
    },
    {
      label: 'Contacts',
      icon: 'bi bi-person-rolodex',
      more: [
        {
          label: 'Provincial Office',
          route: 'provincial-office',
        },
        {
          label: 'Tesda Training Institutions',
          route: 'tesda-training-institutions',
        },
        {
          label: 'Technical Vocational Institutions',
          route: 'technical-vocational-institutions',
        },
        {
          label: 'Add Contact',
          route: 'add-contact',
          queryParams: {
            id: doc(collection(this.firestore, 'contacts')).id,
          },
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
  isSidebarOpen = false;
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggle(item: any) {
    item.open = !item.open;
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
