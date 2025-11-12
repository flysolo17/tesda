import { Component } from '@angular/core';
import { BannerService } from '../../../services/banner.service';
import { CommonModule } from '@angular/common';
import { AnnouncementListComponent } from '../announcement-list/announcement-list.component';
import { CalendarComponent } from '../../calendar/calendar.component';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { NewsAndEventsComponent } from '../../../user/news-and-events/news-and-events.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    AnnouncementListComponent,
    CalendarComponent,
    RouterLink,
    FooterComponent,
    NewsAndEventsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  programs = [
    {
      title: 'TVET Programs',
      desc: 'Short-term courses focused on technical skills training.',
      icon: 'bi-tools',
      bg: '#e7f1ff',
      color: '#0d6efd',
    },
    {
      title: 'Assessment & Certification',
      desc: 'Evaluate your skills and gain national certification from TESDA. ',
      icon: 'bi-patch-check',
      bg: '#fff8e1',
      color: '#ffc107',
    },
  ];

  banners$ = this.bannerService.getAll();
  user: any = null; // Add this if you want to track login state

  constructor(private bannerService: BannerService, private router: Router) {}

  // Add this method to handle the register button
  registerClicked() {
    // Navigate to the register page
    this.router.navigate(['/register']);
  }
}
