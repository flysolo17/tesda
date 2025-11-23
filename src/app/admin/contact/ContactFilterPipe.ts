import { Pipe, PipeTransform } from '@angular/core';
import { Contact } from '../../models/Contacts';

@Pipe({ name: 'filterContacts', standalone: true })
export class ContactFilterPipe implements PipeTransform {
  transform(contacts: Contact[], search: string): Contact[] {
    if (!contacts || !search) return contacts;
    const term = search.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.institution.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }
}
