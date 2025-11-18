import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User } from '../../models/Users';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { EditProfileComponent } from './edit-profile/edit-profile.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {
  user$ = this.authService.getCurrentUser();
  constructor(
    private authService: AuthService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        Swal.fire({
          title: 'Logged out',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
        this.router.navigate(['']);
      }
    });
  }

  editProfile(user: User) {
    const modalRef = this.modalService.open(EditProfileComponent);
    modalRef.componentInstance.user = user;
  }

  onProfileSelected(event: Event, user: User): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.authService
      .uploadProfile(user.id, file)
      .then(() => {
        // Optionally reload user data or update local reference
        Swal.fire({
          icon: 'success',
          title: 'Profile updated',
          text: 'Your profile picture has been updated.',
          timer: 2000,
          showConfirmButton: false,
        });
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Upload failed',
          text: 'There was a problem uploading your profile picture.',
        });
      });
  }
}
