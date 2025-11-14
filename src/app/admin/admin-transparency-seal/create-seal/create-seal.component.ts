import { CommonModule, Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TransparencySealService } from '../../../services/transparency-seal.service';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  FileAttachments,
  QuickLink,
  TransparencySeal,
} from '../../../models/TransparencySeal';

import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateFileComponent } from '../create-file/create-file.component';
import { FileAttachmentService } from '../../../services/file-attachment.service';
import { dA } from '@fullcalendar/core/internal-common';

@Component({
  selector: 'app-create-seal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-seal.component.html',
  styleUrl: './create-seal.component.scss',
})
export class CreateSealComponent implements OnInit {
  id: string | null = null;
  transparencySeal: TransparencySeal | null = null;
  transparencyForm: FormGroup;
  isLoading = false;
  hasUnsavedChanges = true;
  attachments$: FileAttachments[] = [];
  constructor(
    private location: Location,
    private transparencySealService: TransparencySealService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private attachmentService: FileAttachmentService
  ) {
    this.transparencyForm = fb.nonNullable.group({
      title: ['', Validators.required],
      cost: ['', Validators.required],
      date: ['', [Validators.required]],
    });
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
  back() {
    this.location.back();
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

  get links(): FormArray {
    return this.transparencyForm.get('links') as FormArray;
  }

  newLink(link?: QuickLink): FormGroup {
    return this.fb.group({
      label: [link?.label || '', Validators.required],
      link: [link?.link || ''],
    });
  }

  getById(id: string) {
    this.transparencySealService.getById(id).then((e) => {
      if (e) {
        this.transparencySeal = e;
        this.transparencyForm.patchValue({
          title: e.title,
          cost: e.cost,
          date: e.date,
        });
      }
    });
  }
  submit() {
    if (this.id === null) {
      Swal.fire('Missing ID', 'Transparency ID is required.', 'error');
      return;
    }
    if (this.transparencyForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Form',
        text: 'Please fill out all required fields before submitting.',
        confirmButtonColor: '#0d6efd',
      });
      return;
    }
    const handleSuccess = (message: string) => {
      Swal.fire({
        icon: 'success',
        title: message,
        timer: 1500,
        showConfirmButton: false,
        willClose: () => {
          this.hasUnsavedChanges = false;
          this.location.back(); // or modalService.dismissAll();
        },
      });
    };
    const { title, cost, date } = this.transparencyForm.value;

    if (this.transparencySeal === null) {
      const newTrans: TransparencySeal = {
        id: this.id,
        title: title,
        date: date,
        cost: cost,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.create(newTrans);
    } else {
      const updatedTrans: TransparencySeal = {
        ...this.transparencySeal,
        title: title,
        date: date,
        cost: cost,
        updatedAt: new Date(),
      };
      this.update(updatedTrans);
    }
  }

  create(transparencySeal: TransparencySeal) {
    this.isLoading = true;
    this.transparencySealService
      .create(transparencySeal)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Created Successfully',
          text: 'Transparency seal has been added.',
          confirmButtonColor: '#0d6efd',
        }).then(() => {
          this.transparencyForm.reset();
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

  update(transparencySeal: TransparencySeal) {
    this.isLoading = true;
    this.transparencySealService
      .update(transparencySeal)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Updated Successfully',
          text: 'Transparency seal has been updated.',
          confirmButtonColor: '#0d6efd',
        }).then(() => {
          this.hasUnsavedChanges = false;
          this.transparencyForm.reset();
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

  createAttachment() {
    const modal = this.modalService.open(CreateFileComponent);
    modal.componentInstance.transparencyId = this.id;
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
