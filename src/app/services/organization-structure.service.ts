import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import {
  OrganizationalStructure,
  OrganizationalStructureConvert,
} from '../models/OrganizationalStructure';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrganizationStructureService {
  private readonly collectionName = 'organizational_structures';
  constructor(private firestore: Firestore) {}

  create(name: string, description: string, embeddedHtml: string) {
    const collectionRef = collection(this.firestore, this.collectionName);
    const docRef = doc(collectionRef);
    const id = docRef.id;
    const chart: OrganizationalStructure = {
      id: id,
      title: name,
      description: description,
      embeddedHtml: embeddedHtml,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return setDoc(docRef, chart);
  }
  getAll(): Observable<OrganizationalStructure[]> {
    const collectionRef = query(
      collection(this.firestore, this.collectionName).withConverter(
        OrganizationalStructureConvert
      ),
      orderBy('updatedAt', 'asc')
    );
    return collectionData(collectionRef, { idField: 'id' }) as Observable<
      OrganizationalStructure[]
    >;
  }

  delete(id: string): Promise<void> {
    const docRef = doc(this.firestore, this.collectionName, id).withConverter(
      OrganizationalStructureConvert
    );
    return deleteDoc(docRef);
  }
  update(organizationalStructure: OrganizationalStructure): Promise<void> {
    const updatedStructure: OrganizationalStructure = {
      ...organizationalStructure,
      updatedAt: new Date(),
    };

    const docRef = doc(
      this.firestore,
      this.collectionName,
      updatedStructure.id
    ).withConverter(OrganizationalStructureConvert);

    return updateDoc(docRef, updatedStructure);
  }
}
