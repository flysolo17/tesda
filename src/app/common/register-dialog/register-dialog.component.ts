import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-register-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './register-dialog.component.html',
  styleUrl: './register-dialog.component.scss',
})
export class RegisterDialogComponent {
  activeModal = inject(NgbActiveModal);
  loading$ = false;
  userForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.userForm = fb.nonNullable.group(
      {
        name: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(59),
          ],
        ],
        email: ['', [Validators.email, Validators.required]],
        gender: ['', [Validators.required]],
        age: [18, Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: [''],
      },
      { validators: passwordMatchValidator }
    );
  }

  
  submit() {
    if (this.userForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Please make sure all fields are filled correctly.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    const { name, email, age, gender, password } = this.userForm.value;
    this.loading$ = true;

    this.authService
      .registerWithEmailAndPassword(name, age, gender, email, password)
      .then(() => {
        this.loading$ = false;

        Swal.fire({
          icon: 'success',
          title: 'Registration Successful!',
          text: 'You can now log in using your credentials.',
          showConfirmButton: false,
          timer: 2000,
        });

        this.userForm.reset();
        this.activeModal.close();
      })
      .catch((e) => {
        this.loading$ = false;
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: e['message'] ?? 'An unknown error occurred. Please try again.',
          confirmButtonColor: '#d33',
        });
      });
  }

  // REGISTER WITH GOOGLE
  registerWithGoogle() {
    this.loading$ = true;
    this.authService
      .registerWithGoogle()
      .then(() => {
        this.loading$ = false;
        Swal.fire({
          icon: 'success',
          title: 'Registered Successfully!',
          text: 'Your account has been created via Google.',
          showConfirmButton: false,
          timer: 2000,
        });
        this.activeModal.close();
      })
      .catch((e) => {
        this.loading$ = false;
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: e['message'] ?? 'Something went wrong. Please try again.',
          confirmButtonColor: '#d33',
        });
      });
  }
}

// PASSWORD MATCH VALIDATOR
function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}
