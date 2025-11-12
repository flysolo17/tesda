import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TransparencySealService } from '../../services/transparency-seal.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-admin-transparency-seal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-transparency-seal.component.html',
  styleUrl: './admin-transparency-seal.component.scss',
})
export class AdminTransparencySealComponent {
  transparencySeal$ = this.transparencyService.getAll();
  constructor(private transparencyService: TransparencySealService) {}

  delete(id: string) {
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
          .delete(id)
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
}
