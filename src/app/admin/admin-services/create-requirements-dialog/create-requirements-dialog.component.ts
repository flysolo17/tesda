import { Component, Input, OnInit } from '@angular/core';
import { Requirements } from '../../../models/Requirement';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from '../../../services/toastr.service';
import { RequirementService } from '../../../services/requirement.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-requirements-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './create-requirements-dialog.component.html',
  styleUrl: './create-requirements-dialog.component.scss',
})
export class CreateRequirementsDialogComponent implements OnInit {
  requirementForm: FormGroup;
  isLoading = false;
  selectedFile: File | null = null;
  @Input() serviceId: string | null = null;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private requirementService: RequirementService
  ) {
    this.requirementForm = this.fb.group({
      requirement: ['', Validators.required],
      whereToSecure: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  submit() {
    if (this.requirementForm.invalid) {
      this.toastr.showError('Please fill out all required fields.');
      this.requirementForm.markAllAsTouched();
      return;
    }
    if (this.serviceId === null) {
      this.toastr.showError('Invalid Requirement');
    }

    const requirement: Requirements = {
      requirement: this.requirementForm.value.requirement,
      whereToSecure: this.requirementForm.value.whereToSecure,
      id: '',
      createdAt: new Date(),
      serviceId: this.serviceId!!,
    };

    this.create(requirement, this.selectedFile);
  }

  async create(requirement: Requirements, file: File | null) {
    this.isLoading = true;
    try {
      await this.requirementService.create(requirement, file);
      this.toastr.showSuccess('Successfully Created');
      this.activeModal.close();
    } catch (err: any) {
      this.toastr.showError(err?.message ?? 'Unknown Error');
    } finally {
      this.isLoading = false;
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }
}
