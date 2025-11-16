import { Component, inject } from '@angular/core';
import {
  NgbDateStruct,
  NgbModal,
  NgbTimeStruct,
} from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
import { Activity } from '../../../models/Activity';
import { ActivityService } from '../../../services/activity.service';
import { CreateActivityComponent } from './create-activity/create-activity.component';
import { Router, RouterLink } from '@angular/router';
import { collection, doc, Firestore } from '@angular/fire/firestore';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-activities',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-activities.component.html',
  styleUrl: './admin-activities.component.scss',
})
export class AdminActivitiesComponent {
  activities$ = this.activityService.getAll();
  constructor(
    private router: Router,
    private activityService: ActivityService,
    private firestore: Firestore
  ) {}

  create(id: string | null = null) {
    if (id === null) {
      const newId = doc(collection(this.firestore, 'activities')).id;
      this.router.navigate(['/administration/main/create-activity'], {
        queryParams: { id: newId },
      });
    } else {
      this.router.navigate(['/administration/main/create-activity'], {
        queryParams: { id: id },
      });
    }
  }

  formatDate(date: NgbDateStruct): string {
    const { year, month, day } = date;
    return `${month}/${day}/${year}`;
  }

  formatTime(time: NgbTimeStruct): string {
    const hour = time.hour.toString().padStart(2, '0');
    const minute = time.minute.toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }

  edit(activity: Activity): void {
    // Navigate or open edit modal
  }

  async delete(activity: Activity): Promise<void> {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Delete Activity',
      text: `Are you sure you want to delete "${activity.title}"? This action cannot be undone.`,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      await this.activityService.delete(activity);
      await Swal.fire({
        icon: 'success',
        title: 'Deleted',
        text: 'The activity and its image have been successfully deleted.',
      });
    } catch (error) {
      console.error('Delete failed:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Something went wrong while deleting the activity.',
      });
    }
  }
}
