import { Component, OnInit } from '@angular/core';
import { ContactService } from '../../services/contact.service';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, of, startWith } from 'rxjs';
import { Contact, ContactType } from '../../models/Contacts';
import { FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss',
})
export class ContactListComponent implements OnInit {
  contacts$: Observable<Contact[]> = of([]);
  searchControl = new FormControl('');
  type: ContactType | null = null;

  constructor(
    private contactService: ContactService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Read type from route params (optional)
    this.activatedRoute.queryParamMap.subscribe((params) => {
      const typeParam = params.get('type') as ContactType | null;
      this.type = typeParam ?? null;

      const contactsByType$ = this.type
        ? this.contactService.getAllByType(this.type)
        : this.contactService.getAll();

      // Combine contacts with search input
      this.contacts$ = combineLatest([
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
    });
  }
}
