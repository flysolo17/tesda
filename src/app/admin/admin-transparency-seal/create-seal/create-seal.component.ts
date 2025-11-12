import { CommonModule, Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { TransparencySealService } from '../../../services/transparency-seal.service';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { QuickLink, TransparencySeal } from '../../../models/TransparencySeal';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-seal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create-seal.component.html',
  styleUrl: './create-seal.component.scss',
})
export class CreateSealComponent implements OnInit {
  id: string | null = null;
  transparencySeal: TransparencySeal | null = null;
  transparencyForm: FormGroup;
  isLoading = false;
  constructor(
    private location: Location,
    private transparencySealService: TransparencySealService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {
    this.transparencyForm = fb.nonNullable.group({
      title: ['', Validators.required],
      links: this.fb.array([]),
    });
  }

  back() {
    this.location.back();
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((params) => {
      this.id = params.get('id');
      if (this.id) this.getById(this.id);
    });
  }

  get links(): FormArray {
    return this.transparencyForm.get('links') as FormArray;
  }

  newLink(link?: QuickLink): FormGroup {
    return this.fb.group({
      label: [link?.label || '', Validators.required],
      link: [link?.link || ''],
    });
  }

  addLink(): void {
    this.links.push(this.newLink());
  }

  removeLink(index: number): void {
    this.links.removeAt(index);
  }

  getById(id: string) {
    this.transparencySealService.getById(id).then((e) => {
      if (e) {
        this.transparencySeal = e;
        this.transparencyForm.patchValue({
          title: e.title,
        });

        if (e.quickLinks && Array.isArray(e.quickLinks)) {
          e.quickLinks.forEach((l: QuickLink) =>
            this.links.push(this.newLink(l))
          );
        }
      }
    });
  }
  submit() {
    if (this.transparencyForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Form',
        text: 'Please fill out all required fields before submitting.',
        confirmButtonColor: '#0d6efd',
      });
      return;
    }

    const { title, links } = this.transparencyForm.value;
    const transparencySeal: TransparencySeal = {
      id: this.id || '',
      title,
      quickLinks: links,
      createdAt: this.transparencySeal?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (this.transparencySeal === null) {
      this.create(transparencySeal);
    } else {
      this.update(transparencySeal);
    }
  }

  create(transparencySeal: TransparencySeal) {
    this.isLoading = true;
    this.transparencySealService
      .create(transparencySeal)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Created Successfully',
          text: 'Transparency seal has been added.',
          confirmButtonColor: '#0d6efd',
        }).then(() => this.back());
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Creation Failed',
          text: 'An error occurred while creating the transparency seal.',
          confirmButtonColor: '#dc3545',
        });
      })
      .finally(() => (this.isLoading = false));
  }

  update(transparencySeal: TransparencySeal) {
    this.isLoading = true;
    this.transparencySealService
      .update(transparencySeal)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Updated Successfully',
          text: 'Transparency seal has been updated.',
          confirmButtonColor: '#0d6efd',
        }).then(() => this.back());
      })
      .catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: 'An error occurred while updating the transparency seal.',
          confirmButtonColor: '#dc3545',
        });
      })
      .finally(() => (this.isLoading = false));
  }
}
