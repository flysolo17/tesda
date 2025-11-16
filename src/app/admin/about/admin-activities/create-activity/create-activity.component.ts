import { Component, inject, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  NgbActiveModal,
  NgbDatepickerModule,
  NgbDateStruct,
  NgbModalModule,
  NgbModule,
  NgbTimepickerModule,
  NgbTimeStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { Activity } from '../../../../models/Activity';
import { CommonModule, Location } from '@angular/common';
import { ToastrService } from '../../../../services/toastr.service';
import { ActivityService } from '../../../../services/activity.service';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-create-activity',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NgbDatepickerModule,
    NgbTimepickerModule,
  ],
  templateUrl: './create-activity.component.html',
  styleUrl: './create-activity.component.scss',
})
export class CreateActivityComponent implements OnInit {
  activity: Activity | null = null;
  id: string | null = null;
  activityForm: FormGroup;
  selectedImage: File | null = null;
  loading = false;
  hasUnsavedChanges = false;

  constructor(
    private fb: FormBuilder,
    private activityService: ActivityService,
    private location: Location,
    private activatedRoute: ActivatedRoute
  ) {
    this.activityForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      location: ['', Validators.required],
      image: ['', Validators.required],
      description: ['', Validators.required],
      date: [null, Validators.required],
      time: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.getActivity(this.id);
      }
    });
  }

  getActivity(id: string): void {
    this.activityService.getById(id).then((data) => {
      this.activity = data;
      if (this.activity) {
        this.activityForm.patchValue({
          title: this.activity.title,
          image: this.activity.image,
          location: this.activity.location,
          description: this.activity.description,
          date: this.activity.date,
          time: this.activity.time,
        });
      }
    });
  }

  onSelectedImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
      this.activityForm.patchValue({ image: input.files[0].name });
      this.hasUnsavedChanges = true;
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.id) {
      await Swal.fire({
        icon: 'error',
        title: 'Invalid form',
        text: 'Please fill out all required fields correctly.',
      });
      return;
    }
    if (this.activityForm.invalid) {
      this.activityForm.markAllAsTouched();
      await Swal.fire({
        icon: 'error',
        title: 'Invalid form',
        text: 'Please fill out all required fields correctly.',
      });
      return;
    }

    if (!this.selectedImage && !this.activity?.image) {
      await Swal.fire({
        icon: 'error',
        title: 'Missing image',
        text: 'Please select an image before submitting.',
      });
      return;
    }

    this.loading = true;
    try {
      const now = new Date();
      const formValue = this.activityForm.value;

      const dateStr = formValue.date; // e.g., "2025-11-15"
      const timeStr = formValue.time; // e.g., "23:32"

      const sortableDate = new Date(`${dateStr}T${timeStr}`);

      if (this.activity) {
        const activityPayload: Activity = {
          ...this.activity,
          ...formValue,

          updatedAt: now,
        };
        await this.update(activityPayload, this.selectedImage);
        await Swal.fire({
          icon: 'success',
          title: 'Activity updated',
          text: 'Your activity has been successfully updated.',
        });
      } else {
        const activityPayload: Activity = {
          ...formValue,
          sortableDate,
          id: this.id,
          createdAt: now,
          updatedAt: now,
        };
        await this.create(activityPayload, this.selectedImage!);
        await Swal.fire({
          icon: 'success',
          title: 'Activity created',
          text: 'Your activity has been successfully created.',
        });
      }

      this.hasUnsavedChanges = false;
      this.back();
    } catch (error) {
      console.error('Error saving activity:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Save failed',
        text: 'Something went wrong while saving the activity.',
      });
    } finally {
      this.loading = false;
    }
  }

  create(activity: Activity, image: File): Promise<void> {
    return this.activityService.add(activity, image);
  }

  update(activity: Activity, image: File | null = null): Promise<void> {
    return this.activityService.update(activity, image);
  }

  back(): void {
    this.location.back();
  }

  async canDeactivate(): Promise<boolean> {
    if (!this.hasUnsavedChanges) return true;

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Unsaved changes',
      text: 'You have unsaved changes. Do you really want to leave?',
      showCancelButton: true,
      confirmButtonText: 'Leave',
      cancelButtonText: 'Stay',
    });

    return result.isConfirmed;
  }
}
