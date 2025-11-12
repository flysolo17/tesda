import { Injectable } from '@angular/core';
import { Services, ServicesConverter, ServiceType } from '../models/Services';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  Storage,
  deleteObject,
} from '@angular/fire/storage';
import { async, catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgramsService {
  private readonly SERVICES_COLLECTION = 'services';
  constructor(private firestore: Firestore, private storage: Storage) {}

  /**
   * Fetch services with optional type, search filter, and cursor-based pagination
   * @param type Filter by service type, null for all
   * @param lastIndex Last document snapshot for pagination (null for first page)
   * @param count Number of items to fetch
   * @param search Optional search string
   */
  async getServices(
    type: string | null,
    lastIndex: QueryDocumentSnapshot<Services> | null,
    count: number,
    search: string | null = null
  ): Promise<{
    items: Services[];
    lastIndex: QueryDocumentSnapshot<Services> | null;
    total: number;
  }> {
    // Base query for items with ordering
    let servicesQuery = query(
      collection(this.firestore, this.SERVICES_COLLECTION).withConverter(
        ServicesConverter
      ),
      orderBy('updatedAt', 'desc'),
      limit(count)
    );

    // Filter by type if provided
    if (type && type !== 'All Services') {
      servicesQuery = query(servicesQuery, where('type', '==', type));
    }

    // Apply cursor for pagination
    if (lastIndex) {
      servicesQuery = query(servicesQuery, startAfter(lastIndex));
    }

    // Fetch documents for current page
    const snapshot = await getDocs(servicesQuery);
    let items = snapshot.docs.map((doc) => doc.data());

    // Apply search filter locally
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter((item) =>
        item.title.toLowerCase().includes(searchLower)
      );
    }

    const newLastIndex = snapshot.docs[snapshot.docs.length - 1] || null;

    // Total count query (without limit and startAfter)
    let totalQuery = query(
      collection(this.firestore, this.SERVICES_COLLECTION).withConverter(
        ServicesConverter
      )
    );
    if (type && type !== 'All Services') {
      totalQuery = query(totalQuery, where('type', '==', type));
    }
    const totalSnapshot = await getDocs(totalQuery);

    // Apply search filter locally for total as well
    let total = totalSnapshot.size;
    if (search) {
      const searchLower = search.toLowerCase();
      total = totalSnapshot.docs.filter((doc) =>
        doc.data().title.toLowerCase().includes(searchLower)
      ).length;
    }

    return { items, lastIndex: newLastIndex, total };
  }

  create(service: Services): Promise<void> {
    const collectionRef = collection(this.firestore, this.SERVICES_COLLECTION);
    const docRef = doc(collectionRef);
    const id = docRef.id;

    const newService: Services = {
      ...service,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return setDoc(docRef, newService);
  }

  async delete(id: string, iconUrl: string | null): Promise<void> {
    const docRef = doc(this.firestore, this.SERVICES_COLLECTION, id);
    const deleteOps: Promise<any>[] = [deleteDoc(docRef)];

    if (iconUrl) {
      const iconRef = ref(this.storage, iconUrl);
      deleteOps.push(deleteObject(iconRef));
    }

    return Promise.all(deleteOps)
      .then(() => {
        console.log(`Service ${id} and icon deleted successfully`);
      })
      .catch((err) => {
        console.error('Deletion failed:', err);
        throw err;
      });
  }

  async getById(id: string): Promise<Services | null> {
    try {
      const docRef = doc(
        this.firestore,
        this.SERVICES_COLLECTION,
        id
      ).withConverter(ServicesConverter);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error(`Error fetching document with ID ${id}:`, error);
      return null;
    }
  }

  getByType(type: ServiceType): Observable<Services[]> {
    const q = query(
      collection(this.firestore, this.SERVICES_COLLECTION).withConverter(
        ServicesConverter
      ),
      where('type', '==', type),
      orderBy('updatedAt', 'desc')
    );
    return collectionData(q);
  }

  getByProvider(providers: string[]): Observable<Services[]> {
    if (!providers?.length) return of([]);

    const servicesRef = collection(
      this.firestore,
      this.SERVICES_COLLECTION
    ).withConverter(ServicesConverter);

    const q = query(
      servicesRef,
      where('provider', 'in', providers.slice(0, 10)) // Firestore limit: max 10
    );

    return collectionData(q);
  }

  getAll(): Observable<Services[]> {
    const q = query(
      collection(this.firestore, this.SERVICES_COLLECTION).withConverter(
        ServicesConverter
      ),

      orderBy('updatedAt', 'desc')
    );
    return collectionData(q);
  }
  update(service: Services): Promise<void> {
    const docRef = doc(this.firestore, this.SERVICES_COLLECTION, service.id);

    const updatePayload: Partial<Services> = {
      ...service,
      updatedAt: new Date(),
    };

    return updateDoc(docRef, updatePayload);
  }
}
