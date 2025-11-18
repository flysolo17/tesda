import { Injectable } from '@angular/core';
import { Provider, ProviderConverter, ProviderType } from '../models/Provider';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { catchError, from, map, Observable, of, switchMap } from 'rxjs';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';
import { Services, ServicesConverter } from '../models/Services';
import { ProgramsService } from './programs.service';
export interface ProviderWithServices {
  provider: Provider;
  services: Services[];
}
@Injectable({
  providedIn: 'root',
})
export class ProviderService {
  private readonly collectionName = 'providers';
  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private programService: ProgramsService
  ) {}

  async createProvider(provider: Provider) {
    const providersRef = collection(this.firestore, this.collectionName);
    const docRef = doc(providersRef);
    const id = docRef.id;

    const newProvider: Provider = {
      ...provider,
      id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return setDoc(docRef, newProvider);
  }

  async getAll(): Promise<Provider[]> {
    const q = collection(this.firestore, this.collectionName).withConverter(
      ProviderConverter
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  }

  getAllProviders(): Observable<Provider[]> {
    const q = query(
      collection(this.firestore, this.collectionName).withConverter(
        ProviderConverter
      ),
      orderBy('updatedAt', 'asc')
    );
    return collectionData(q, { idField: 'id' });
  }

  async update(provider: Provider) {
    const docRef = doc(
      this.firestore,
      this.collectionName,
      provider.id
    ).withConverter(ProviderConverter);

    const updatedProvider: Provider = {
      ...provider,

      updatedAt: new Date(),
    };
    return updateDoc(docRef, updatedProvider);
  }
  delete(id: string) {
    const docRef = doc(this.firestore, this.collectionName, id).withConverter(
      ProviderConverter
    );
    return deleteDoc(docRef);
  }
}
