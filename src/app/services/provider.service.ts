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

  async createProvider(provider: Provider, file: File | null) {
    const providersRef = collection(this.firestore, this.collectionName);
    const docRef = doc(providersRef);
    const id = docRef.id;
    let fileUrl: string | null = null;

    if (file) {
      const ext = file.name.split('.').pop(); // Get file extension
      const fileRef = ref(this.storage, `services/files/${id}.${ext}`);
      await uploadBytes(fileRef, file);
      fileUrl = await getDownloadURL(fileRef);
    }

    const newProvider: Provider = {
      ...provider,
      id: id,
      file: fileUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return setDoc(docRef, newProvider);
  }

  getProviderByType(type: ProviderType): Observable<ProviderWithServices[]> {
    const providersRef = collection(
      this.firestore,
      this.collectionName
    ).withConverter(ProviderConverter);
    const providersQuery = query(
      providersRef,
      where('type', '==', type),
      orderBy('createdAt', 'asc')
    );

    return from(getDocs(providersQuery)).pipe(
      map((snapshot) => snapshot.docs.map((doc) => doc.data())),
      switchMap((providers: Provider[]) => {
        if (providers.length === 0) return of([]);

        const servicesRef = collection(
          this.firestore,
          'services'
        ).withConverter(ServicesConverter);
        return from(getDocs(servicesRef)).pipe(
          map((snapshot) => snapshot.docs.map((doc) => doc.data())),
          map((allServices: Services[]) =>
            providers.map((provider) => ({
              provider,
              services: allServices.filter((s) =>
                Array.isArray(s.provider)
                  ? s.provider.includes(provider.id)
                  : s.provider === provider.id
              ),
            }))
          ),
          catchError((err) => {
            console.error('Error fetching services:', err);
            return of(providers.map((p) => ({ provider: p, services: [] })));
          })
        );
      }),
      catchError((err) => {
        console.error('Error fetching providers:', err);
        return of([]);
      })
    );
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
      orderBy('updatedAt', 'desc')
    );
    return collectionData(q, { idField: 'id' });
  }
  async update(provider: Provider, file: File | null = null) {
    const docRef = doc(
      this.firestore,
      this.collectionName,
      provider.id
    ).withConverter(ProviderConverter);
    let fileUrl: string | null = null;
    if (file) {
      const ext = file.name.split('.').pop();
      const fileRef = ref(this.storage, `services/files/${provider.id}.${ext}`);
      await uploadBytes(fileRef, file);
      fileUrl = await getDownloadURL(fileRef);
    }
    const updatedProvider: Provider = {
      ...provider,
      file: fileUrl ?? provider.file,
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
