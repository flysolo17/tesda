import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-forgot-password-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './forgot-password-dialog.component.html',
  styleUrl: './forgot-password-dialog.component.scss',
})
export class ForgotPasswordDialogComponent {
  isLoading = false;
  emailControl = new FormControl('', [Validators.required, Validators.email]);

  constructor(
    private authService: AuthService,
    private activeModal: NgbActiveModal
  ) {}

  close() {
    this.activeModal.close();
  }

  submit() {
    const email = this.emailControl.value;
    if (this.emailControl.invalid || email === null) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
      });
      return;
    }

    this.isLoading = true;
    this.authService
      .forgotPassword(email)
      .then(() => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Email Sent',
          text: 'A password reset link has been sent to your email.',
        }).then(() => this.close());
      })
      .catch((error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Request Failed',
          text:
            error?.message || 'Something went wrong. Please try again later.',
        });
      });
  }
}
