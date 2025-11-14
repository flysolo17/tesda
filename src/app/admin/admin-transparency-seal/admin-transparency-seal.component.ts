import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TransparencySealService } from '../../services/transparency-seal.service';
import Swal from 'sweetalert2';
import { collection, doc, Firestore } from '@angular/fire/firestore';
import { TransparencySeal } from '../../models/TransparencySeal';
@Component({
  selector: 'app-admin-transparency-seal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-transparency-seal.component.html',
  styleUrl: './admin-transparency-seal.component.scss',
})
export class AdminTransparencySealComponent {
  transparencySeal$ = this.transparencyService.getWithAttachments();
  constructor(
    private transparencyService: TransparencySealService,
    private firestore: Firestore,
    private router: Router
  ) {}

  delete(trans: TransparencySeal) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This transparency seal will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.transparencyService
          .delete(trans)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted Successfully',
              text: 'The transparency seal has been removed.',
              confirmButtonColor: '#0d6efd',
              timer: 1500,
              showConfirmButton: false,
            });
          })
          .catch(() => {
            Swal.fire({
              icon: 'error',
              title: 'Delete Failed',
              text: 'Something went wrong while deleting the record.',
              confirmButtonColor: '#dc3545',
            });
          });
      }
    });
  }
  new(id: string | null = null) {
    if (id === null) {
      const newId = doc(collection(this.firestore, 'transparency-seal')).id;
      this.router.navigate(['/administration/main/create-seal'], {
        queryParams: { id: newId },
      });
    } else {
      this.router.navigate(['/administration/main/create-seal'], {
        queryParams: { id: id },
      });
    }
  }
}
