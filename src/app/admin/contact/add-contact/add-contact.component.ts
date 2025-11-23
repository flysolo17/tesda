import { Component, OnInit } from '@angular/core';
import { ContactService } from '../../../services/contact.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Contact, ContactType } from '../../../models/Contacts';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-contact',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './add-contact.component.html',
  styleUrl: './add-contact.component.scss',
})
export class AddContactComponent implements OnInit {
  id: string | null = null;
  contactForm: FormGroup;
  types = Object.values(ContactType);
  contact: Contact | null = null;
  isLoading = false;

  constructor(
    private contactService: ContactService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private route: Router
  ) {
    this.contactForm = fb.nonNullable.group({
      name: ['', Validators.required],
      institution: ['', Validators.required],
      description: [''],
      contact: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      type: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.activatedRoute.queryParamMap.subscribe((param) => {
      this.id = param.get('id');
      if (this.id) {
        this.getContactById(this.id);
      }
    });
  }

  async getContactById(id: string) {
    const data = await this.contactService.getById(id);
    if (data) {
      this.contact = data;
      this.contactForm.patchValue({ ...this.contact });
    }
  }

  async submit() {
    if (this.contactForm.invalid) {
      Swal.fire('Error', 'Please fill in all required fields.', 'error');
      return;
    }

    this.isLoading = true;

    try {
      if (this.contact) {
        // Update existing contact
        const updatedContact: Contact = {
          ...this.contact,
          ...this.contactForm.value,
          updatedAt: new Date(),
        };
        await this.update(updatedContact);
        Swal.fire('Success', 'Contact updated successfully!', 'success');
      } else {
        // Create new contact
        const newContact: Contact = {
          id: this.id,
          ...this.contactForm.value,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Contact;
        await this.create(newContact);
        Swal.fire('Success', 'Contact created successfully!', 'success');
      }

      const type = this.contactForm.value.type as ContactType;
      this.contactForm.reset();
      this.route.navigate(['/administration/main', this.navigateByType(type)]);
    } catch (error) {
      Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
    } finally {
      this.isLoading = false;
    }
  }

  async create(contact: Contact) {
    return this.contactService.create(contact);
  }

  async update(contact: Contact) {
    return this.contactService.update(contact);
  }

  navigateByType(type: ContactType) {
    if (type === ContactType.PROVINCIAL_OFFICE) {
      return 'provincial-office';
    } else if (type === ContactType.TECHNICAL_VOCATIONAL_INSTITUTIONS) {
      return 'technical-vocational-institutions';
    } else {
      return 'tesda-training-institutions';
    }
  }
}
