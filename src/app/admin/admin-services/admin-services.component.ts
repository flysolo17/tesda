import { Component, inject, OnInit } from '@angular/core';
import { ProgramsService } from '../../services/programs.service';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';
import {
  combineLatest,
  debounceTime,
  map,
  Observable,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import { Services, ServiceType } from '../../models/Services';
import { CommonModule, DecimalPipe } from '@angular/common';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  ɵInternalFormsSharedModule,
} from '@angular/forms';
import {
  collection,
  doc,
  Firestore,
  QueryDocumentSnapshot,
} from '@angular/fire/firestore';
import {
  NgbTypeaheadModule,
  NgbPaginationModule,
} from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-services',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
    NgbTypeaheadModule,
    NgbPaginationModule,
  ],
  templateUrl: './admin-services.component.html',
  styleUrl: './admin-services.component.scss',
})
export class AdminServicesComponent implements OnInit {
  programService = inject(ProgramsService);
  router = inject(Router);
  firestore = inject(Firestore);

  searchControl = new FormControl('');
  services$: Observable<Services[]> = this.programService.getAll();
  isLoading = false;
  filteredServices$: Observable<Services[]> = combineLatest([
    this.services$,
    this.searchControl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([services, search]) => {
      const term = search?.toLowerCase() || '';
      return services.filter(
        (s) =>
          s.title.toLowerCase().includes(term) ||
          s.qualification.toLowerCase().includes(term)
      );
    })
  );

  ngOnInit(): void {}

  new() {
    const id = doc(collection(this.firestore, 'services')).id;
    this.router.navigate(['/administration/main/create-service'], {
      queryParams: { id },
    });
  }

  editService(service: Services) {
    this.router.navigate(['/administration/main/create-service'], {
      queryParams: { id: service.id },
    });
  }
  deleteService(id: string) {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'This service will be permanently deleted.',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.programService
          .delete(id)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Service has been successfully deleted.',
              timer: 1500,
              showConfirmButton: false,
            });

            // Optional: remove deleted service from local filtered list
            this.filteredServices$ = this.filteredServices$.pipe(
              map((services) => services.filter((s) => s.id !== id))
            );
          })
          .catch((err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: err?.message || 'Failed to delete service.',
            });
          });
      }
    });
  }
}
