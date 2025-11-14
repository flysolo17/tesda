import { Component, OnInit } from '@angular/core';
import { PostingService } from '../../services/posting.service';
import {
  NgbModal,
  NgbPaginationModule,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';
import { PhilGEPS } from '../../models/PhilGEPS';
import { CreatePostingComponent } from './create-posting/create-posting.component';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { collection, doc, Firestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
@Component({
  selector: 'app-admin-philgeps-posting',
  standalone: true,
  imports: [
    DecimalPipe,
    FormsModule,
    NgbTypeaheadModule,
    NgbPaginationModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './admin-philgeps-posting.component.html',
  styleUrl: './admin-philgeps-posting.component.scss',
})
export class AdminPhilgepsPostingComponent {
  postings$ = this.postingService.getWithAttachments();

  searchTerm = new FormControl('');

  constructor(
    private postingService: PostingService,
    private modalService: NgbModal,
    private firestore: Firestore,
    private router: Router
  ) {}

  create(id: string | null = null) {
    if (id == null) {
      const newId = doc(collection(this.firestore, 'philgeps-postings')).id;
      this.router.navigate(['/administration/main/create-posting'], {
        queryParams: { id: newId },
      });
    } else {
      this.router.navigate(['/administration/main/create-posting'], {
        queryParams: { id },
      });
    }
  }

  delete(post: PhilGEPS) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This posting will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.postingService
          .delete(post)
          .then(() => {
            Swal.fire('Deleted!', 'The posting has been deleted.', 'success');
          })
          .catch(() => {
            Swal.fire('Error!', 'Failed to delete posting.', 'error');
          });
      }
    });
  }
}
