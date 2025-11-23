import { Injectable } from '@angular/core';
import { Contact, ContactConverter, ContactType } from '../models/Contacts';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly collectionRef = collection(
    this.firestore,
    'contacts'
  ).withConverter(ContactConverter);
  constructor(private firestore: Firestore) {}

  create(contact: Contact) {
    const docRef = doc(this.collectionRef, contact.id);

    return setDoc(docRef, contact);
  }
  update(contact: Contact) {
    const { id, ...rest } = contact;
    const data = {
      ...rest,
      updatedAt: new Date(),
    };
    const docRef = doc(this.collectionRef, id);
    return updateDoc(docRef, data);
  }
  delete(id: string) {
    return deleteDoc(doc(this.collectionRef, id));
  }

  getAll(): Observable<Contact[]> {
    return collectionData(this.collectionRef);
  }
  getAllByType(type: ContactType): Observable<Contact[]> {
    const q = query(
      this.collectionRef,
      where('type', '==', type),
      orderBy('createdAt', 'asc')
    );
    return collectionData(q);
  }
  async getById(id: string): Promise<Contact | null> {
    const docRef = doc(this.collectionRef, id);
    const snapshot = await getDoc(docRef);
    return snapshot.exists() ? (snapshot.data() as Contact) : null;
  }
}
