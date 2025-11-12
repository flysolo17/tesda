import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import { UserType } from '../../models/Users';
import Swal from 'sweetalert2';
import { ToastrService } from '../../services/toastr.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.scss',
})
export class LoginDialogComponent {
  activeModal = inject(NgbActiveModal);
  loginForm: FormGroup;
  loading$ = false;
  private router = inject(Router);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.loginForm = fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit() {
    if (this.loginForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Please fill out all required fields correctly.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const { email, password } = this.loginForm.value;
    this.loading$ = true;

    this.authService
      .loginWithEmailAndPassword(email, password)
      .then((data) => {
        this.loading$ = false;

        if (data.type === UserType.ADMIN) {
          this.authService.logout();
          this.toastr.showError('Admin Cannot Logged in here');
          this.activeModal.close(data);
        } else {
          this.toastr.showSuccess('Successfully Logged in!');
          this.activeModal.close(false);
        }
      })
      .catch((e) => {
        this.toastr.showError(e['message'] ?? 'Unknown Error');
        this.loading$ = false;
      });
  }

  loginWithGoogle() {
    this.loading$ = true;

    this.authService
      .loginWithGoogle()
      .then((data) => {
        this.loading$ = false;

        if (data.type === UserType.ADMIN) {
          this.activeModal.close(true);
        } else {
          this.activeModal.close(data.id);
        }
      })
      .catch((e) => {
        this.toastr.showError(e['message'] ?? 'Unknown Error');
        this.activeModal.close(false);
        this.loading$ = false;
      });
  }

  // ✅ Add this method to handle Sign Up click
  registerClicked() {
    this.activeModal.close(); // Close the login modal
    this.router.navigate(['/register']); // Navigate to the registration page
  }
}
