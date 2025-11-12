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

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private programService: ProgramsService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private providerService: ProviderService
  ) {
    this.serviceForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      type: [ServiceType.G2B, Validators.required],

      provider: [[], Validators.required],
      selectedProvider: [null],
    });
  }

  ngOnInit(): void {
    this.providerService.getAll().then((providers) => {
      this.providers = providers;
      console.log(providers);
    });

    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.id = params.get('id');
      if (this.id) {
        this.loadService(this.id);
      }
    });
  }

  /** Provider handling */
  getProviderName(id: string): string {
    return this.providers.find((p) => p.id === id)?.name || 'Unknown';
  }

  addProvider(): void {
    const control = this.serviceForm.get('provider');
    const current = control?.value || [];
    const selected = this.serviceForm.get('selectedProvider')?.value;

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

  /** Navigation */
  back() {
    this.location.back();
  }

  /** Load and submit logic unchanged */
  async loadService(id: string) {
    this.isLoading = true;
    try {
      const service: Services | null = await this.programService.getById(id);
      if (service) {
        this.serviceForm.patchValue({
          title: service.title,
          description: service.description,
          type: service.type,
          provider: service.provider || [],
        });
      }
    } catch {
      this.toastr.showError('Failed to load service.');
    } finally {
      this.isLoading = false;
    }
  }

  async submit() {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    try {
      await this.programService.create(this.serviceForm.value);
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Service created successfully.',
        confirmButtonColor: '#3085d6',
      });

      this.serviceForm.reset();

      this.back();
    } catch {
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to create service. Please try again.',
        confirmButtonColor: '#d33',
      });
    } finally {
      this.isLoading = false;
    }
  }
}
