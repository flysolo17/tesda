import { Component, OnInit } from '@angular/core';
import { PostingService } from '../../services/posting.service';
import {
  NgbModal,
  NgbPaginationModule,
  NgbTypeaheadModule,
} from '@ng-bootstrap/ng-bootstrap';
import { PhilGEPS } from '../../models/PhilGEPS';
import { CreatePostingComponent } from '../dialogs/create-posting/create-posting.component';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { debounceTime, distinctUntilChanged } from 'rxjs';
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
export class AdminPhilgepsPostingComponent implements OnInit {
  postings: PhilGEPS[] = [];
  filteredPostings: PhilGEPS[] = [];

  searchTerm = new FormControl('');
  page = 1;
  pageSize = 10;

  constructor(
    private postingService: PostingService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadPostings();

    // Subscribe to search term changes for live filtering
    this.searchTerm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.applySearch(term);
      });
  }

  loadPostings() {
    this.postingService.getAll().subscribe((data) => {
      this.postings = data;
      this.applySearch(this.searchTerm.value);
    });
  }

  applySearch(term: string | null) {
    if (!term) {
      this.filteredPostings = [...this.postings];
    } else {
      const lowerTerm = term.toLowerCase();
      this.filteredPostings = this.postings.filter(
        (p) =>
          p.title.toLowerCase().includes(lowerTerm) ||
          p.details.toLowerCase().includes(lowerTerm) ||
          p.date.toLowerCase().includes(lowerTerm)
      );
    }
  }

  create(post: PhilGEPS | null = null) {
    const modalRef = this.modalService.open(CreatePostingComponent, {
      size: 'lg',
      backdrop: 'static',
    });
    modalRef.componentInstance.post = post;
    modalRef.result
      .then((result) => {
        if (result) this.loadPostings();
      })
      .catch(() => {});
  }

  edit(post: PhilGEPS) {
    this.create(post);
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
            this.loadPostings();
          })
          .catch(() => {
            Swal.fire('Error!', 'Failed to delete posting.', 'error');
          });
      }
    });
  }
}
