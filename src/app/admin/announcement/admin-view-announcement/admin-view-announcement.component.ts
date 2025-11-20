import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Announcement } from '../../../models/Announcement';
import { AnnouncementService } from '../../../services/announcement.service';
import { CommonModule, Location } from '@angular/common';
import { delay } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-view-announcement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-view-announcement.component.html',
  styleUrl: './admin-view-announcement.component.scss',
})
export class AdminViewAnnouncementComponent implements OnInit {
  announcement$: Announcement | null = null;
  id: string | null = null;
  isLoading = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private announcementService: AnnouncementService,
    private location: Location,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(async (params) => {
      this.id = params.get('id') ?? null;
      if (this.id) {
        this.getAnnouncement(this.id);
      }
    });
  }
  async getAnnouncement(id: string) {
    this.isLoading = true;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1-second delay
      this.announcement$ = await this.announcementService.getById(id);
    } catch (error) {
      console.error('Error fetching announcement:', error);
    } finally {
      this.isLoading = false;
    }
  }
  back() {
    this.location.back();
  }
  onDelete(): void {
    if (this.announcement$ === null) {
      return;
    }
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the announcement.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.announcementService
          .delete(this.announcement$!!)
          .then(() => {
            Swal.fire(
              'Deleted!',
              'The announcement has been removed.',
              'success'
            );
            this.back();
          })
          .catch((error) => {
            Swal.fire('Error', 'Failed to delete announcement.', 'error');
            console.error('Delete error:', error);
          });
      }
    });
  }
  create(id: string) {
    this.router.navigate(['/administration/main/create-content'], {
      queryParams: {
        id: id,
        type: 'announcement',
      },
    });
  }
}
