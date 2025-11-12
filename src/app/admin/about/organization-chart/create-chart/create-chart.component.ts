import { Component, Input, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrganizationStructureService } from '../../../../services/organization-structure.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { OrganizationalStructure } from '../../../../models/OrganizationalStructure';
@Component({
  selector: 'app-create-chart',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-chart.component.html',
  styleUrl: './create-chart.component.scss',
})
export class CreateChartComponent implements OnInit {
  @Input() org: OrganizationalStructure | null = null;

  orgForm: FormGroup;
  isLoading: boolean = false;
  constructor(
    private activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private organizationService: OrganizationStructureService
  ) {
    this.orgForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      embeddedHtml: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.org) {
      this.orgForm.patchValue({
        title: this.org.title,
        description: this.org.description,
        embeddedHtml: this.org.embeddedHtml,
      });
    }
  }

  submit() {
    if (this.orgForm.invalid) {
      Swal.fire('Invalid Form', 'Please fill in all required fields.', 'error');
      return;
    }

    const { title, description, embeddedHtml } = this.orgForm.value;
    this.isLoading = true;

    if (this.org?.id) {
      const updated: OrganizationalStructure = {
        ...this.org,
        title,
        description,
        embeddedHtml,
      };
      this.organizationService
        .update(updated)
        .then(() => {
          Swal.fire(
            'Updated',
            'Organizational Structure updated successfully',
            'success'
          );
          this.close();
        })
        .catch((error) => {
          Swal.fire('Error', error.message || 'An error occurred', 'error');
        })
        .finally(() => {
          this.isLoading = false;
        });
    } else {
      this.organizationService
        .create(title, description, embeddedHtml)
        .then(() => {
          Swal.fire(
            'Created',
            'Organizational Structure created successfully',
            'success'
          );
          this.close();
        })
        .catch((error) => {
          Swal.fire('Error', error.message || 'An error occurred', 'error');
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  save(title: string, description: string, embeddedHtml: string) {
    this.organizationService
      .create(title, description, embeddedHtml)
      .then(() => {
        Swal.fire(
          'Success',
          'Organizational Structure created successfully',
          'success'
        );
        this.close();
      })
      .catch((error) => {
        Swal.fire('Error', error.message || 'An error occurred', 'error');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
  close() {
    this.activeModal.close();
  }
}
