import { Component } from '@angular/core';
import { Firestore, doc, collection } from '@angular/fire/firestore';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of, combineLatest, startWith, map } from 'rxjs';
import Swal from 'sweetalert2';
import { Announcement } from '../../../models/Announcement';
import { AnnouncementService } from '../../../services/announcement.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-news-and-events',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './admin-news-and-events.component.html',
  styleUrl: './admin-news-and-events.component.scss',
})
export class AdminNewsAndEventsComponent {
  searchControl = new FormControl('');
  announcements$: Observable<Announcement[]> = of([]);

  constructor(
    private announcementService: AnnouncementService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private firestore: Firestore
  ) {}

  ngOnInit(): void {
    const allAnnouncements$ = this.announcementService.getAllNewsAndEvents();

    this.announcements$ = combineLatest([
      allAnnouncements$,
      this.searchControl.valueChanges.pipe(startWith('')),
    ]).pipe(
      map(([announcements, search]) =>
        announcements.filter(
          (a) =>
            a.title.toLowerCase().includes(search?.toLowerCase() ?? '') ||
            a.summary.toLowerCase().includes(search?.toLowerCase() ?? '')
        )
      )
    );
  }

  onCreate(): void {
    this.router.navigate(['create'], { relativeTo: this.activatedRoute });
  }

  onView(id: string): void {
    this.router.navigate(['view', id], { relativeTo: this.activatedRoute });
  }

  onEdit(id: string): void {
    this.router.navigate(['edit', id], { relativeTo: this.activatedRoute });
  }

  onDelete(announcement: Announcement): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the announcement.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.announcementService
          .delete(announcement)
          .then(() => {
            Swal.fire(
              'Deleted!',
              'The announcement has been removed.',
              'success'
            );
            this.searchControl.setValue(this.searchControl.value); // trigger refresh
          })
          .catch((error) => {
            Swal.fire('Error', 'Failed to delete announcement.', 'error');
            console.error('Delete error:', error);
          });
      }
    });
  }
  create(id: string | null = null) {
    if (id === null) {
      id = doc(collection(this.firestore, 'announcements')).id;
    }
    this.router.navigate(['/administration/main/create-content'], {
      queryParams: {
        id: id,
      },
    });
  }
}
