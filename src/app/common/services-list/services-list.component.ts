import {
  Component,
  inject,
  OnInit,
  signal,
  TemplateRef,
  WritableSignal,
} from '@angular/core';
import { ProgramsService } from '../../services/programs.service';
import { CommonModule, DecimalPipe } from '@angular/common';
import {
  NgbAccordionModule,
  NgbOffcanvas,
  NgbPaginationModule,
  NgbTypeaheadModule,
  OffcanvasDismissReasons,
} from '@ng-bootstrap/ng-bootstrap';
import { Services, ServiceType } from '../../models/Services';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StringFormat } from '@angular/fire/storage';
import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Requirements } from '../../models/Requirement';
import { RequirementService } from '../../services/requirement.service';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [
    CommonModule,
    NgbAccordionModule,

    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
    NgbTypeaheadModule,
    NgbPaginationModule,
  ],
  templateUrl: './services-list.component.html',
  styleUrl: './services-list.component.scss',
})
export class ServicesListComponent implements OnInit {
  private offcanvasService = inject(NgbOffcanvas);
  private programService = inject(ProgramsService);
  private requirementService = inject(RequirementService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  // Offcanvas
  closeResult: WritableSignal<string> = signal('');
  selectedService: Services | null = null;

  // Filters
  type$ = ['All Services', ...Object.values(ServiceType)];
  type: string | null = 'All Services';
  search: string | null = null;
  pageSize = 10;

  // Pagination
  page = 1;
  collectionSize = 0;

  // Services data
  services: Services[] = [];
  lastIndex: QueryDocumentSnapshot<Services> | null = null;
  isLoading = false;
  noMoreData = false;
  requirements$: Requirements[] = [];
  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const newType = params.get('type') || 'All Services';
      const newSearch = params.get('search') || null;
      const newSize = Number(params.get('size')) || 10;
      const newPage = Number(params.get('page')) || 1;

      this.type = newType;
      this.search = newSearch;
      this.pageSize = newSize;
      this.page = newPage;

      this.refreshServices();
    });
  }

  async loadServices(reset: boolean = true) {
    if (this.isLoading || this.noMoreData) return;
    this.isLoading = true;

    if (reset) {
      this.services = [];
      this.lastIndex = null;
      this.noMoreData = false;
    }

    try {
      const res = await this.programService.getServices(
        this.type === 'All Services' ? null : this.type,
        this.lastIndex,
        this.pageSize,
        this.search
      );

      if (res.items.length === 0) this.noMoreData = true;
      else {
        this.services = [...this.services, ...res.items];
        this.lastIndex = res.lastIndex;
      }

      this.collectionSize =
        this.services.length + (this.noMoreData ? 0 : this.pageSize);
      this.updateQueryParams();
    } catch (err) {
      console.error('Failed to load services', err);
    } finally {
      this.isLoading = false;
    }
  }

  loadNext() {
    this.loadServices(false);
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadServices(true);
  }

  refreshServices() {
    this.page = 1;
    this.lastIndex = null;
    this.noMoreData = false;
    this.loadServices(true);
  }

  updateQueryParams() {
    const queryParams: any = {
      type: this.type,
      size: this.pageSize,
      page: this.page,
    };
    if (this.search && this.search.trim() !== '') {
      queryParams.search = this.search;
    }

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  openOffcanvas(content: TemplateRef<any>, service: Services) {
    this.selectedService = service;
    this.requirements$ = [];

    this.requirementService.getRequirements(service.id).then((reqs) => {
      this.requirements$ = reqs;
    });

    this.offcanvasService
      .open(content, {
        ariaLabelledBy: 'offcanvas-basic-title',
        position: 'end',
      })
      .result.then(
        (result) => this.closeResult.set(`Closed with: ${result}`),
        (reason) =>
          this.closeResult.set(`Dismissed ${this.getDismissReason(reason)}`)
      );
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case OffcanvasDismissReasons.ESC:
        return 'by pressing ESC';
      case OffcanvasDismissReasons.BACKDROP_CLICK:
        return 'by clicking on the backdrop';
      default:
        return `with: ${reason}`;
    }
  }

  downloadFile(fileUrl: string | null) {
    if (!fileUrl) return;
    window.open(fileUrl, '_blank'); // Opens the file in a new tab
  }

  bookAppointment(serviceId: string | undefined) {
    if (!serviceId) return;
    this.router.navigate(['/appointment/book'], {
      queryParams: { serviceId },
    });
  }
}
