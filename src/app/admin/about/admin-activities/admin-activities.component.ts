import { Component, inject } from '@angular/core';
import { NgbModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '@angular/common';
import { Activity } from '../../../models/Activity';
import { ActivityService } from '../../../services/activity.service';
import { CreateActivityComponent } from '../../dialogs/create-activity/create-activity.component';

@Component({
  selector: 'app-admin-activities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-activities.component.html',
  styleUrl: './admin-activities.component.scss',
})
export class AdminActivitiesComponent {
  private modalService = inject(NgbModal);
  private activityService = inject(ActivityService);
  $activities = this.activityService.getAll();
  constructor() {}
  open(activity: Activity | null = null) {
    const modal = this.modalService.open(CreateActivityComponent);
    modal.componentInstance.activity = activity;
  }

  getMonthAbbr(month: number): string {
    return [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ][month - 1];
  }

  formatTime(time: NgbTimeStruct): string {
    const hour = time.hour % 12 || 12;
    const minute = String(time.minute).padStart(2, '0');
    const meridian = time.hour >= 12 ? 'PM' : 'AM';
    return `${hour}:${minute} ${meridian}`;
  }
}
