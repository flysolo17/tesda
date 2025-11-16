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

  constructor(
    private activeModal: NgbActiveModal,
    private providerService: ProviderService,
    private fb: FormBuilder
  ) {
    this.providerForm = this.fb.group({
      name: ['', Validators.required],
      type: [null, Validators.required],
      address: ['', Validators.required],
      contactNumber: [''],
      email: ['', [Validators.email]],
    });
  }

  ngOnInit(): void {
    if (this.provider) {
      this.providerForm.patchValue({
        name: this.provider.name,
        type: this.provider.type,
        address: this.provider.address,
        contactNumber: this.provider.contactNumber,
        email: this.provider.email,
      });
    }
  }

  submit(): void {
    console.log(this.provider);
    if (this.providerForm.invalid) {
      Swal.fire('Invalid Form', 'Please fill in all required fields.', 'error');
      return;
    }

    this.isLoading = true;
    const { name, type, address, contactNumber, email } =
      this.providerForm.value;

    if (this.provider) {
      const updated: Provider = {
        ...this.provider,
        name: name,
        type: type,
        address: address,
        contactNumber: contactNumber,
        email: email,
        updatedAt: new Date(),
      };
      this.updateProvider(updated);
    } else {
      const newProvider: Provider = {
        id: '',
        name: name,
        type: type,
        address: address,
        contactNumber: contactNumber,
        email: email,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.saveProvider(newProvider);
    }
  }

  saveProvider(provider: Provider): void {
    this.providerService
      .createProvider(provider)
      .then(() => {
        Swal.fire('Created', 'Provider added successfully.', 'success');
        this.close();
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
      .update(provider)
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
}
