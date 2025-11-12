import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrganizationalStructure } from '../../../models/OrganizationalStructure';
import { CreateChartComponent } from './create-chart/create-chart.component';
import { OrganizationStructureService } from '../../../services/organization-structure.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-organization-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organization-chart.component.html',
  styleUrl: './organization-chart.component.scss',
})
export class OrganizationChartComponent {
  structures$ = this.orgService.getAll();
  constructor(
    private modalService: NgbModal,
    private orgService: OrganizationStructureService,
    private sanitizer: DomSanitizer
  ) {}

  createChart(org: OrganizationalStructure | null = null) {
    const modalRef = this.modalService.open(CreateChartComponent);
    modalRef.componentInstance.org = org;
  }

  deleteChart(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the chart.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
    }).then((result) => {
      if (result.isConfirmed) {
        this.orgService.delete(id).then(() => {
          Swal.fire('Deleted!', 'The chart has been deleted.', 'success');
        });
      }
    });
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
