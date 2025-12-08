import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { StoryService } from '../../../services/story.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { OurStory } from '../../../models/OurStory';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-story',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './create-story.component.html',
  styleUrl: './create-story.component.scss',
})
export class CreateStoryComponent implements OnInit {
  @Input() id: string | null = null;

  isLoading: boolean = false;
  storyForm: FormGroup;
  selectedVideo: File | null = null;
  existingStory?: OurStory;

  constructor(
    private fb: FormBuilder,
    private storyService: StoryService,
    private activeModal: NgbActiveModal
  ) {
    this.storyForm = fb.nonNullable.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.id) {
      this.loadStory();
    }
  }

  // ----------------------------------------------------
  // LOAD STORY FOR EDIT MODE
  // ----------------------------------------------------
  loadStory() {
    this.isLoading = true;

    Swal.fire({
      title: 'Loading...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.storyService
      .getById(this.id!)
      .then((story) => {
        if (story) {
          this.existingStory = story;
          this.storyForm.patchValue({
            title: story.title,
            description: story.description,
          });
        }
      })
      .catch(() => Swal.fire('Error', 'Failed to load story data.', 'error'))
      .finally(() => {
        this.isLoading = false;
        Swal.close();
      });
  }

  // ----------------------------------------------------
  // VIDEO UPLOAD HANDLER
  // ----------------------------------------------------
  onVideoSelected(event: any) {
    const file = event.target.files?.[0];
    this.selectedVideo = file || null;
  }

  // ----------------------------------------------------
  // SAVE (CREATE OR UPDATE)
  // ----------------------------------------------------
  save() {
    if (this.storyForm.invalid) {
      Swal.fire('Invalid', 'Please fill out all required fields.', 'warning');
      return;
    }

    if (!this.id && !this.selectedVideo) {
      Swal.fire('Missing Video', 'Please upload a video.', 'warning');
      return;
    }

    const formValue = this.storyForm.value;

    Swal.fire({
      title: 'Saving...',
      text: 'Please wait while we save your story.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    // -------------------------
    // CREATE MODE
    // -------------------------
    if (!this.id) {
      const story: OurStory = {
        id: '',
        title: formValue.title,
        description: formValue.description,
        videoUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.storyService
        .create(story, this.selectedVideo!)
        .then(() => {
          Swal.fire('Success', 'Story created successfully!', 'success').then(
            () => this.activeModal.close(true)
          );
        })
        .catch(() => Swal.fire('Error', 'Failed to create story.', 'error'));
      return;
    }

    // -------------------------
    // UPDATE MODE
    // -------------------------
    const updated: OurStory = {
      ...this.existingStory!,
      title: formValue.title,
      description: formValue.description,
    };

    this.storyService
      .update(updated, this.selectedVideo)
      .then(() => {
        Swal.fire('Success', 'Story updated successfully!', 'success').then(
          () => this.activeModal.close(true)
        );
      })
      .catch(() => {
        Swal.fire('Error', 'Failed to update story.', 'error');
      });
  }

  // ----------------------------------------------------
  // CANCEL WITH CONFIRMATION (Optional)
  // ----------------------------------------------------
  close() {
    Swal.fire({
      title: 'Cancel?',
      text: 'Are you sure you want to close without saving?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, close it',
      cancelButtonText: 'No',
    }).then((res) => {
      if (res.isConfirmed) {
        this.activeModal.dismiss();
      }
    });
  }
}
