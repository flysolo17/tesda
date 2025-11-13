import { Component, OnInit } from '@angular/core';
import { ProgramsService } from '../../../services/programs.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from '../../../services/toastr.service';
import { Services, ServiceType } from '../../../models/Services';
import { CommonModule, Location } from '@angular/common';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { ProviderService } from '../../../services/provider.service';
import { Provider } from '../../../models/Provider';
import { CanComponentDeactivate } from '../exit-page.guard';
import { RequirementService } from '../../../services/requirement.service';
import { Requirements } from '../../../models/Requirement';
import { firstValueFrom, take } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateRequirementsDialogComponent } from '../create-requirements-dialog/create-requirements-dialog.component';
@Component({
  selector: 'app-create-service',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './create-service.component.html',
  styleUrl: './create-service.component.scss',
})
export class CreateServiceComponent implements OnInit {
  serviceForm: FormGroup;
  isLoading = false;
  serviceTypes = Object.values(ServiceType);
  id: string | null = null;
  providers: Provider[] = [];
  service$: Services | null = null;
  requirements$: Requirements[] = [];
  hasUnsavedChanges = true;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private programService: ProgramsService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private modalService: NgbModal,
    private providerService: ProviderService,
    private requirementService: RequirementService
  ) {
    this.serviceForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      qualification: ['', Validators.required],
      type: [ServiceType.G2B, Validators.required],
      provider: [[], Validators.required],
      selectedProvider: [null],
    });
  }

  ngOnInit(): void {
    this.loadProviders();

    this.activatedRoute.queryParamMap.pipe(take(1)).subscribe((params) => {
      this.id = params.get('id');
      if (this.id) {
        this.loadRequirements(this.id);
        this.loadService(this.id);
      }
    });
  }

  /** Providers handling */
  private async loadProviders() {
    try {
      this.providers = await this.providerService.getAll();
    } catch (err) {
      console.error('Failed to load providers', err);
    }
  }

  getProviderName(id: string): string {
    return this.providers.find((p) => p.id === id)?.name || 'Unknown';
  }

  addProvider(): void {
    const control = this.serviceForm.get('provider');
    const selected = this.serviceForm.get('selectedProvider')?.value;
    const current = control?.value || [];

    if (selected && !current.includes(selected)) {
      control?.setValue([...current, selected]);
    }
    this.serviceForm.get('selectedProvider')?.setValue(null);
  }

  removeProvider(id: string): void {
    const control = this.serviceForm.get('provider');
    const current = control?.value || [];
    control?.setValue(current.filter((pid: string) => pid !== id));
  }

  /** Requirements */
  private loadRequirements(serviceId: string) {
    this.requirementService.getByServiceId(serviceId).subscribe({
      next: (data) => (this.requirements$ = data),
      error: (err) => console.error('Failed to load requirements', err),
    });
  }

  createRequirements() {
    if (!this.id) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot add requirement',
        text: 'Service ID is missing.',
      });
      return;
    }
    const modalRef = this.modalService.open(CreateRequirementsDialogComponent);
    modalRef.componentInstance.serviceId = this.id;
  }

  async deleteRequirement(id: string, fileUrl?: string | null) {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'This requirement will be permanently deleted.',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.requirementService.delete(id, fileUrl);
      }
    });
  }

  /** Load existing service */
  private async loadService(id: string) {
    this.isLoading = true;
    try {
      const service = await this.programService.getById(id);
      this.service$ = service;

      if (service) {
        this.serviceForm.patchValue({
          title: service.title,
          qualification: service.qualification,
          description: service.description,
          type: service.type,
          provider: service.provider || [],
        });
      }
    } catch (err) {
      this.toastr.showError('Failed to load service.');
    } finally {
      this.isLoading = false;
    }
  }

  /** Submit form */
  submit() {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const service: Services = { ...this.serviceForm.value, id: this.id };

    const handleSuccess = (message: string) => {
      Swal.fire({
        icon: 'success',
        title: message,
        timer: 1500,
        showConfirmButton: false,
        willClose: () => {
          this.hasUnsavedChanges = false;
          this.location.back(); // or modalService.dismissAll();
        },
      });
    };

    const operation = this.service$
      ? this.programService.update(service)
      : this.programService.create(service);

    operation
      .then(() =>
        handleSuccess(this.service$ ? 'Service updated!' : 'Service created!')
      )
      .catch((err) =>
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: err?.message || 'Failed to save service.',
        })
      )
      .finally(() => (this.isLoading = false));
  }

  /** Navigation */
  back() {
    this.location.back();
  }

  /** Unsaved changes guard */
  async canDeactivate(): Promise<boolean> {
    if (!this.hasUnsavedChanges) return true;

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Unsaved changes',
      text: 'You have unsaved changes. Do you really want to leave?',
      showCancelButton: true,
      confirmButtonText: 'Leave',
      cancelButtonText: 'Stay',
    });

    return result.isConfirmed;
  }
}
