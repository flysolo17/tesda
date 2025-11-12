import { Component } from '@angular/core';
import { map, Observable, of, shareReplay } from 'rxjs';
import { AnnouncementService } from '../../../services/announcement.service';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { Announcement } from '../../../models/Announcement';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-news-and-events-list',
  standalone: true,
  imports: [NgbNavModule, CommonModule, RouterModule],
  templateUrl: './news-and-events-list.component.html',
  styleUrl: './news-and-events-list.component.scss',
})
export class NewsAndEventsListComponent {
  private items$: Observable<Announcement[]> = this.announcementService
    .getAllNewsAndEvents()
    .pipe(shareReplay(1));

  constructor(private announcementService: AnnouncementService) {}

  get news(): Observable<Announcement[]> {
    return this.items$.pipe(
      map((items) => items.filter((item) => item.type === 'news'))
    );
  }

  get events(): Observable<Announcement[]> {
    return this.items$.pipe(
      map((items) => items.filter((item) => item.type === 'events'))
    );
  }
}
