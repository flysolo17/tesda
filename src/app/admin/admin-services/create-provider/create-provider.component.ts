import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ProviderService } from '../../../services/provider.service';
import { Provider, ProviderType } from '../../../models/Provider';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-provider',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './create-provider.component.html',
  styleUrl: './create-provider.component.scss',
})
export class CreateProviderComponent implements OnInit {
  @Input() provider: Provider | null = null;

  providerForm: FormGroup;
  isLoading = false;
  providerTypes = Object.values(ProviderType);
  selectedFile: File | null = null;
  constructor(
    private activeModal: NgbActiveModal,
    private providerService: ProviderService,
    private fb: FormBuilder
  ) {
    this.providerForm = this.fb.group({
      name: ['', Validators.required],
      region: [''],
      province: [''],
      type: [null, Validators.required],
      address: ['', Validators.required],
      contactNumber: [''],
      email: ['', [Validators.email]],
      requirements: this.fb.array([this.createRequirementField()]),
      latitude: [null],
      longitude: [null],
    });
  }

  ngOnInit(): void {
    if (this.provider) {
      this.providerForm.patchValue({
        name: this.provider.name,
        region: this.provider.region,
        province: this.provider.province,
        type: this.provider.type,
        address: this.provider.address,
        contactNumber: (this.provider as any).contactNumber || '',
        email: (this.provider as any).email || '',
        latitude: this.provider.location?.latitude ?? null,
        longitude: this.provider.location?.longitude ?? null,
      });
      const reqArray = this.requirements;
      reqArray.clear();
      this.provider.requirements?.forEach((req) => {
        reqArray.push(this.fb.control(req, Validators.required));
      });
    }
  }

  submit(): void {
    if (this.providerForm.invalid) {
      Swal.fire('Invalid Form', 'Please fill in all required fields.', 'error');
      return;
    }

    this.isLoading = true;
    const formValue = this.providerForm.value;

    const location =
      formValue.latitude && formValue.longitude
        ? { latitude: formValue.latitude, longitude: formValue.longitude }
        : undefined;

    const payload: Provider = {
      ...(this.provider ?? { id: this.generateId(), createdAt: new Date() }),
      ...formValue,
      location,
      updatedAt: new Date(),
    };

    this.provider?.id
      ? this.updateProvider(payload)
      : this.saveProvider(payload);
  }

  saveProvider(provider: Provider): void {
    this.providerService
      .createProvider(provider, this.selectedFile)
      .then(() => {
        Swal.fire('Created', 'Provider added successfully.', 'success');
        this.close();
        this.requirements.clear();
        this.requirements.push(this.createRequirementField());
      })
      .catch((error) => {
        Swal.fire('Error', error.message || 'An error occurred.', 'error');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  updateProvider(provider: Provider): void {
    this.providerService
      .update(provider, this.selectedFile)
      .then(() => {
        Swal.fire('Updated', 'Provider updated successfully.', 'success');
        this.close();
      })
      .catch((error) => {
        Swal.fire('Error', error.message || 'An error occurred.', 'error');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  close(): void {
    this.activeModal.close();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  /** Getters */
  get requirements(): FormArray {
    return this.providerForm.get('requirements') as FormArray;
  }

  /** Create requirement control */
  createRequirementField(): FormControl {
    return this.fb.control('', [
      Validators.required,
      Validators.maxLength(200),
    ]);
  }

  /** Add/Remove requirement fields */
  addRequirement() {
    this.requirements.push(this.createRequirementField());
  }

  removeRequirement(index: number) {
    if (this.requirements.length > 1) this.requirements.removeAt(index);
  }
  /** File upload */
  onIconSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.selectedFile = file || null;
  }
}
