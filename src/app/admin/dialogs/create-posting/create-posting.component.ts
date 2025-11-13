import { Component, Input, OnInit } from '@angular/core';
import { PhilGEPS } from '../../../models/PhilGEPS';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PostingService } from '../../../services/posting.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { reference } from '@popperjs/core';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-create-posting',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './create-posting.component.html',
  styleUrl: './create-posting.component.scss',
})
export class CreatePostingComponent implements OnInit {
  @Input() post: PhilGEPS | null = null;
  postingForm: FormGroup;
  isLoading = false;
  file: File | null = null;

  constructor(
    private fb: FormBuilder,
    private postingService: PostingService,
    private activeModal: NgbActiveModal
  ) {
    this.postingForm = this.fb.nonNullable.group({
      title: ['', Validators.required],
      cost: [null, Validators.required],
      details: ['', Validators.required],
      date: ['', Validators.required],
      attachment: [null],
    });
  }

  ngOnInit(): void {
    if (this.post) {
      this.postingForm.patchValue({
        title: this.post.title,
        cost: this.post.cost,
        details: this.post.details,
        date: this.post.date,
      });
    }
  }

  onFileChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.file = file;
    }
  }

  async submit() {
    if (this.postingForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Form',
        text: 'Please fill out all required fields.',
      });
      return;
    }

    const { title, cost, details, date } = this.postingForm.value;
    const postData: PhilGEPS = {
      id: this.post?.id || '',
      title,
      cost,
      details,
      date,
      attachment: null, // will be uploaded separately
      createdAt: this.post?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    this.isLoading = true;

    try {
      if (!this.post) {
        await this.postingService.create(postData, this.file);
        Swal.fire({
          icon: 'success',
          title: 'Created Successfully',
          text: 'New posting has been added.',
        });
      } else {
        await this.postingService.update(postData, this.file);
        Swal.fire({
          icon: 'success',
          title: 'Updated Successfully',
          text: 'Posting details have been updated.',
        });
      }

      this.activeModal.close(true);
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: error.message || 'Something went wrong.',
      });
    } finally {
      this.isLoading = false;
    }
  }

  closeModal() {
    this.activeModal.dismiss();
  }
}
