import { Component, Input, OnInit } from '@angular/core';
import { PhilGEPS } from '../../../models/PhilGEPS';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostingService } from '../../../services/posting.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { reference } from '@popperjs/core';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { FileAttachmentService } from '../../../services/file-attachment.service';
import { FileAttachments } from '../../../models/TransparencySeal';
import { CreateFileComponent } from '../../admin-transparency-seal/create-file/create-file.component';
@Component({
  selector: 'app-create-posting',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './create-posting.component.html',
  styleUrl: './create-posting.component.scss',
})
export class CreatePostingComponent implements OnInit {
  post: PhilGEPS | null = null;
  id: string | null = null;
  postingForm: FormGroup;
  isLoading = false;
  attachments$: FileAttachments[] = [];
  hasUnsavedChanges = true;
  constructor(
    private fb: FormBuilder,
    private postingService: PostingService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private attachmentService: FileAttachmentService
  ) {
    this.postingForm = this.fb.nonNullable.group({
      title: ['', Validators.required],
      cost: [null, Validators.required],
      details: ['', Validators.required],
      date: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.id = params.get('id');
      if (this.id) {
        this.attachmentService
          .getAllByTransparencyId(this.id)
          .subscribe((data) => {
            this.attachments$ = data;
          });
        this.getById(this.id);
      }
    });
  }

  getById(id: string) {
    this.postingService.getById(id).then((e) => {
      if (e) {
        this.post = e;
        this.postingForm.patchValue({
          title: e.title,
          details: e.details,
          cost: e.cost,
          date: e.date,
        });
      }
    });
  }
  async submit() {
    if (this.id === null) {
      Swal.fire('Missing ID', 'Transparency ID is required.', 'error');
      return;
    }
    if (this.postingForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Form',
        text: 'Please fill out all required fields before submitting.',
        confirmButtonColor: '#0d6efd',
      });
      return;
    }

    const { title, cost, details, date } = this.postingForm.value;
    if (this.post === null) {
      const newPost: PhilGEPS = {
        id: this.id,
        title: title,
        cost: cost,
        details: details,
        date: date,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.create(newPost);
    } else {
      const updatedPost: PhilGEPS = {
        ...this.post,
        title: title,
        cost: cost,
        details: details,
        date: date,
        updatedAt: new Date(),
      };
      this.update(updatedPost);
    }
  }

  create(philgeps: PhilGEPS) {
    this.isLoading = true;
    this.postingService
      .create(philgeps)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Created Successfully',
          text: 'Transparency seal has been added.',
          confirmButtonColor: '#0d6efd',
        }).then(() => {
          this.postingForm.reset();
          this.hasUnsavedChanges = false;
          this.back();
        });
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text: 'An error occurred while creating the transparency seal.',
          confirmButtonColor: '#dc3545',
        });
      })
      .finally(() => (this.isLoading = false));
  }

  update(philgeps: PhilGEPS) {
    this.isLoading = true;
    this.postingService
      .update(philgeps)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Updated Successfully',
          text: 'PhilGEPS has been updated.',
          confirmButtonColor: '#0d6efd',
        }).then(() => {
          this.hasUnsavedChanges = false;
          this.postingForm.reset();
          this.back();
        });
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'An error occurred while updating the transparency seal.',
          confirmButtonColor: '#dc3545',
        });
      })
      .finally(() => (this.isLoading = false));
  }

  back() {
    this.location.back();
  }
  createAttachment() {
    const modal = this.modalService.open(CreateFileComponent);
    modal.componentInstance.transparencyId = this.id;
  }

  delete(id: string, filePath: string | null): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This file will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.attachmentService
          .delete(id, filePath)
          .then(() => {
            Swal.fire('Deleted!', 'The file has been deleted.', 'success');
          })
          .catch((error) => {
            console.error(error);
            Swal.fire(
              'Error',
              'Failed to delete the file. Please try again.',
              'error'
            );
          });
      }
    });
  }

  /** Unsaved changes guard */
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
