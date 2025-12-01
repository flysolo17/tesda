import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BannerService } from '../../../services/banner.service';
import { CommonModule } from '@angular/common';
import { AnnouncementListComponent } from '../announcement-list/announcement-list.component';
import { CalendarComponent } from '../../calendar/calendar.component';
import { Router, RouterModule } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { NewsAndEventsComponent } from '../../../user/news-and-events/news-and-events.component';
import { User } from '../../../models/Users';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

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
    RouterModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
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
  users$: User | null = null;
  constructor(
    private bannerService: BannerService,
    private authService: AuthService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((data) => {
      this.users$ = data;
    });
  }

  book() {
    if (this.users$ === null) {
      Swal.fire({
        icon: 'warning',
        title: 'Login required',
        text: 'Please log in before booking.',
      });
      return;
    }
    this.router.navigate(['/landing-page/create-appointment'], {
      queryParams: { id: this.users$.id },
    });
  }
}
