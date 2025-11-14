import { Component, inject, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  NgbActiveModal,
  NgbModal,
  NgbModalModule,
} from '@ng-bootstrap/ng-bootstrap';
import { FileAttachmentService } from '../../../services/file-attachment.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FileAttachments } from '../../../models/TransparencySeal';
@Component({
  selector: 'app-create-file',
  standalone: true,
  imports: [NgbModalModule, ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './create-file.component.html',
  styleUrl: './create-file.component.scss',
})
export class CreateFileComponent {
  @Input() transparencyId: string | null = null;
  activeModal = inject(NgbActiveModal);
  attachmentForm: FormGroup;
  selectedFile: File | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private fileAttachmentService: FileAttachmentService
  ) {
    this.attachmentForm = fb.group({
      title: ['', Validators.required],
    });
  }

  submit() {
    if (this.transparencyId === null) {
      Swal.fire('Missing ID', 'Transparency ID is required.', 'error');
      return;
    }

    if (this.attachmentForm.invalid) {
      Swal.fire(
        'Invalid Form',
        'Please fill out the required fields.',
        'warning'
      );
      return;
    }

    const title = this.attachmentForm.value.title;
    this.create(title, this.selectedFile);
  }

  create(title: string, file: File | null) {
    if (this.transparencyId === null) return;

    const attachment: FileAttachments = {
      id: '',
      transparencyId: this.transparencyId,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.isLoading = true;

    this.fileAttachmentService
      .create(attachment, file)
      .then(() => {
        Swal.fire('Success', 'File uploaded successfully.', 'success');
        this.attachmentForm.reset();
        this.selectedFile = null;
        this.activeModal.close(true);
      })
      .catch((error) => {
        console.error(error);
        Swal.fire(
          'Upload Failed',
          'Something went wrong. Please try again.',
          'error'
        );
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }
}
