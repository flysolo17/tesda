import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Announcement } from '../../models/Announcement';
import { CommonModule, Location } from '@angular/common';
import { ToastrService } from '../../services/toastr.service';
import { AnnouncementService } from '../../services/announcement.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-announcement',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-announcement.component.html',
  styleUrl: './create-announcement.component.scss',
})
export class CreateAnnouncementComponent implements OnInit {
  announcementForm: FormGroup;
  imageFile?: File;
  announcement: Announcement | null = null;
  loading = false;
  type: Announcement['type'] | null = null;
  id: string | null = null;

  constructor(
    private fb: FormBuilder,
    private announcementService: AnnouncementService,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {
    this.announcementForm = this.fb.nonNullable.group({
      type: ['announcement', Validators.required],
      title: ['', Validators.required],
      summary: ['', Validators.required],
      content: ['', Validators.required],
      source: [''],
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((param) => {
      this.id = param.get('id');
      const rawType = param.get('type');
      this.type =
        rawType === 'announcement' || rawType === 'news' || rawType === 'events'
          ? (rawType as Announcement['type'])
          : null;

      if (this.id) {
        this.getAnnouncement(this.id);
      }
    });
  }

  async getAnnouncement(id: string) {
    this.loading = true;
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.announcement = await this.announcementService.getById(id);
      if (this.announcement) {
        this.announcementForm.patchValue({
          type: this.announcement.type,
          title: this.announcement.title,
          summary: this.announcement.summary,
          content: this.announcement.content,
          source: this.announcement.source,
        });
      }
    } catch (error) {
      console.error('Error fetching announcement:', error);
      Swal.fire('Error', 'Failed to load announcement.', 'error');
    } finally {
      this.loading = false;
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.imageFile = input.files[0];
    }
  }

  submit(): void {
    if (this.announcementForm.invalid) {
      Swal.fire(
        'Incomplete',
        'Please fill out all required fields.',
        'warning'
      );
      return;
    }
    if (!this.id) {
      Swal.fire(
        'Incomplete',
        'Please fill out all required fields.',
        'warning'
      );
      return;
    }

    const formValue = this.announcementForm.value;

    if (this.announcement) {
      const announcement: Announcement = {
        ...this.announcement,
        type: formValue.type,
        title: formValue.title,
        summary: formValue.summary,
        content: formValue.content,
        source: formValue.source,
        updatedAt: new Date(),
      };
      this.edit(announcement, this.imageFile ?? null);
    } else if (this.imageFile) {
      const announcement: Announcement = {
        id: this.id,
        image: '',
        type: formValue.type,
        title: formValue.title,
        summary: formValue.summary,
        content: formValue.content,
        source: formValue.source,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.create(announcement, this.imageFile);
    } else {
      Swal.fire(
        'Missing Image',
        'Please upload an image before submitting.',
        'warning'
      );
    }
  }

  create(announcement: Announcement, file: File) {
    this.loading = true;
    this.announcementService
      .create(announcement, file)
      .then(() => {
        Swal.fire('Created!', 'Announcement has been posted.', 'success');
        this.announcementForm.reset();
        this.imageFile = undefined;
        this.back();
      })
      .catch((e) => {
        console.error('Create error:', e);
        Swal.fire('Error', 'Failed to create announcement.', 'error');
      })
      .finally(() => {
        this.loading = false;
      });
  }

  edit(announcement: Announcement, file: File | null) {
    this.loading = true;
    this.announcementService
      .edit(announcement, file)
      .then(() => {
        Swal.fire('Updated!', 'Announcement has been updated.', 'success');
        this.back();
      })
      .catch((e) => {
        console.error('Edit error:', e);
        Swal.fire('Error', 'Failed to update announcement.', 'error');
        this.back();
      })
      .finally(() => {
        this.loading = false;
      });
  }
  back() {
    this.location.back();
  }
}
