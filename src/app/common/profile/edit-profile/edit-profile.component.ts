import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/Users';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss',
})
export class EditProfileComponent implements OnInit {
  @Input({ required: true }) user: User | null = null;

  userForm: FormGroup;

  constructor(
    private activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.userForm = fb.nonNullable.group({
      name: ['', Validators.required],
      age: ['', Validators.required],
      gender: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.userForm.patchValue({
        name: this.user.name,
        age: this.user.age,
        gender: this.user.gender,
      });
    }
  }

  submit(): void {
    if (this.user === null) {
      Swal.fire({
        icon: 'error',
        title: 'Missing user data',
        text: 'Cannot update profile without user information.',
      });
      return;
    }

    if (this.userForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid form',
        text: 'Please fill out all required fields correctly.',
      });
      return;
    }

    const { name, age, gender } = this.userForm.value;
    const updatedUser: User = {
      ...this.user,
      name,
      age,
      gender,
      updatedAt: new Date(),
    };

    this.authService
      .updateUser(updatedUser)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Profile updated',
          text: 'Your profile has been successfully updated.',
          timer: 2000,
          showConfirmButton: false,
        });
        this.close();
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Update failed',
          text: 'Something went wrong while updating your profile.',
        });
      });
  }
  close() {
    this.activeModal.close();
  }
}
