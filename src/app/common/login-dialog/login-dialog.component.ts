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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
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
          Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Admin cannot log in here.',
            confirmButtonColor: '#d33',
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            text: 'Welcome back to TESDA Occidental Mindoro.',
            showConfirmButton: false,
            timer: 2000,
          });

          this.activeModal.close(false);
        }
      })
      .catch((e) => {
        this.loading$ = false;
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: e['message'] ?? 'Incorrect email or password. Please try again.',
          confirmButtonColor: '#d33',
        });
        this.activeModal.close(false);
      });
  }

 
  loginWithGoogle() {
    this.loading$ = true;

    this.authService
      .loginWithGoogle()
      .then((data) => {
        this.loading$ = false;

        if (data.type === UserType.ADMIN) {
          Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Admin cannot log in through Google here.',
          });
          this.activeModal.close(true);
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Successfully Logged In!',
            showConfirmButton: false,
            timer: 2000,
          });
          this.activeModal.close(false);
        }
      })
      .catch((e) => {
        this.loading$ = false;
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: e['message'] ?? 'An unknown error occurred. Please try again.',
        });
        this.activeModal.close(false);
      });
  }
}
