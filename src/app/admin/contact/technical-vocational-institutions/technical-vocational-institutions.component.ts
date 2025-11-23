import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, combineLatest, startWith, map } from 'rxjs';
import Swal from 'sweetalert2';
import { Contact, ContactType } from '../../../models/Contacts';
import { ContactService } from '../../../services/contact.service';
import { ContactFilterPipe } from '../ContactFilterPipe';

@Component({
  selector: 'app-technical-vocational-institutions',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ContactFilterPipe],
  templateUrl: './technical-vocational-institutions.component.html',
  styleUrl: './technical-vocational-institutions.component.scss',
})
export class TechnicalVocationalInstitutionsComponent implements OnInit {
  contact$: Observable<Contact[]> = of([]);
  searchControl = new FormControl('');

  constructor(private contactService: ContactService, private router: Router) {}

  ngOnInit(): void {
    const contactsByType$ = this.contactService.getAllByType(
      ContactType.TECHNICAL_VOCATIONAL_INSTITUTIONS
    );

    // Combine contacts with search input
    this.contact$ = combineLatest([
      contactsByType$,
      this.searchControl.valueChanges.pipe(startWith('')),
    ]).pipe(
      map(([contacts, search]) => {
        if (!search) return contacts;
        const term = search.toLowerCase();
        return contacts.filter(
          (c) =>
            c.name.toLowerCase().includes(term) ||
            c.institution.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.contact.toLowerCase().includes(term)
        );
      })
    );
  }

  editContact(id: string) {
    this.router.navigate(['administration/main/add-contact'], {
      queryParams: { id },
    });
  }

  deleteContact(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.contactService
          .delete(id)
          .then(() => {
            Swal.fire('Deleted!', 'Contact has been removed.', 'success');
          })
          .catch(() => {
            Swal.fire('Error', 'Something went wrong while deleting.', 'error');
          });
      }
    });
  }
}
