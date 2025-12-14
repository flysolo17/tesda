import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { User, UserType } from '../../models/Users';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { map, Observable } from 'rxjs';
import { PhoneVerificationComponent } from '../../admin/login/phone-verification/phone-verification.component';
import { dA } from '@fullcalendar/core/internal-common';
import { Auth, unlink } from '@angular/fire/auth';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';

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
    private router: Router,
    private auth: Auth,
    private firestore: Firestore
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

  enablePhoneAuth(user: User) {
    if (user.phone) {
      // 🔓 Disable 2FA with confirmation
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        Swal.fire('Error', 'No current user found.', 'error');
        return;
      }

      Swal.fire({
        title: 'Disable Phone Authentication?',
        text: 'This will remove your linked phone number and disable 2FA.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, disable it',
        cancelButtonText: 'Cancel',
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await Promise.all([
              unlink(currentUser, 'phone'),
              updateDoc(doc(this.firestore, 'users', currentUser.uid), {
                phone: null,
              }),
            ]);
            Swal.fire('Success', 'Phone authentication disabled.', 'success');
          } catch (err: any) {
            Swal.fire(
              'Error',
              err?.message ?? 'Failed to disable phone auth.',
              'error'
            );
          }
        }
      });
    } else {
      const modalRef = this.modalService.open(PhoneVerificationComponent);
      modalRef.componentInstance.operation = 'combined';
      modalRef.componentInstance.currentUser = this.auth.currentUser;
      modalRef.closed.subscribe((data) => {
        console.log(data);
      });
    }
  }
}
