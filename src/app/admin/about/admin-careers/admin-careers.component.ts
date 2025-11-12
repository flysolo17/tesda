import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import Swal from 'sweetalert2';
import { Career } from '../../../models/Careeer';
import { CareerService } from '../../../services/career.service';
import { ToastrService } from '../../../services/toastr.service';
import { AddCareersComponent } from '../../dialogs/add-careers/add-careers.component';
@Component({
  selector: 'app-admin-careers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-careers.component.html',
  styleUrl: './admin-careers.component.scss',
})
export class AdminCareersComponent implements OnInit, OnDestroy {
  careers: Career[] = [];
  selectedFile: File | null = null;
  title: string = '';
  description: string = '';
  private subscriptions: Subscription[] = [];

  constructor(
    private careerService: CareerService,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    const sub = this.careerService.getAll().subscribe({
      next: (data) => (this.careers = data),
      error: (err) => console.error(err),
    });
    this.subscriptions.push(sub);
  }

  openCreateCareerDialog(career: Career | null) {
    const modalRef = this.modalService.open(AddCareersComponent);
    modalRef.componentInstance.career = career;
  }

  deleteCareer(career: Career): void {
    const sub = this.careerService.delete(career.id, career.image).subscribe({
      next: () => this.toastr.showSuccess('Career deleted successfully!'),
      error: (err) => this.toastr.showError(err.message),
    });

    this.subscriptions.push(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  trackByTitle(index: number, item: { title: string }): string {
    return item.title;
  }
}
