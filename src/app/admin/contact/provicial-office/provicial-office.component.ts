import { Component, OnInit } from '@angular/core';
import { ContactService } from '../../../services/contact.service';
import { combineLatest, map, Observable, of, startWith } from 'rxjs';
import { Contact, ContactType } from '../../../models/Contacts';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ContactFilterPipe } from '../ContactFilterPipe';

@Component({
  selector: 'app-provicial-office',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ContactFilterPipe, RouterModule],
  templateUrl: './provicial-office.component.html',
  styleUrl: './provicial-office.component.scss',
})
export class ProvicialOfficeComponent implements OnInit {
  contact$: Observable<Contact[]> = of([]);
  searchControl = new FormControl('');

  constructor(private contactService: ContactService, private router: Router) {}

  ngOnInit(): void {
    const contactsByType$ = this.contactService.getAllByType(
      ContactType.PROVINCIAL_OFFICE
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
