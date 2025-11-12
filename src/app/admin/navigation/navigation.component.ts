import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule, RouterOutlet } from '@angular/router';
import {
  NgbCollapseModule,
  NgbDropdownModule,
  NgbNavModule,
} from '@ng-bootstrap/ng-bootstrap';

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
      route: 'appointments',
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
          label: 'Create Announcements',
          route: 'create-announcement',
        },
      ],
    },
    {
      label: 'Feedback',
      icon: '',
      route: 'feedback',
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

  constructor(public route: ActivatedRoute) {}
}
