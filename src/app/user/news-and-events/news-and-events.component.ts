import { Component } from '@angular/core';
import { AnnouncementService } from '../../services/announcement.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-news-and-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-and-events.component.html',
  styleUrl: './news-and-events.component.scss',
})
export class NewsAndEventsComponent {
  items$ = this.announcementService.getAllPartialNewsAndEvents();
  constructor(private announcementService: AnnouncementService) {}
}
