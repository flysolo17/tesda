import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../../services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import Swal from 'sweetalert2';
import { Notification } from '../../../models/Notification';

@Component({
  selector: 'app-view-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-notification.component.html',
  styleUrl: './view-notification.component.scss',
})
export class ViewNotificationComponent implements OnInit {
  notificationId: string | null = null;
  notification: Notification | null = null;
  loading = true;

  constructor(
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.notificationId = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.notificationId) {
      this.getNotificationById(this.notificationId);
    } else {
      this.loading = false;
    }
  }

  getNotificationById(id: string) {
    this.notificationService
      .getNotificationById(id)
      .then((e) => {
        this.notification = e;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  deleteNotification() {
    if (this.notificationId === null) {
      if (this.notificationId === null) {
        Swal.fire({
          title: 'Notification not found',
          text: 'No notification ID was provided.',
          icon: 'warning',
          confirmButtonText: 'Back',
        }).then(() => this.back());
        return;
      }

      return;
    }
    Swal.fire({
      title: 'Delete Notification?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await this.notificationService.deleteNotification(
            this.notificationId!!
          );
          Swal.fire('Deleted!', 'Notification has been removed.', 'success');
          this.back();
        } catch (err: any) {
          console.log(err);
          Swal.fire(
            'Error',
            err.message ?? 'Failed to delete notification.',
            'error'
          );
        }
      }
    });
  }

  back() {
    this.location.back();
  }
}
