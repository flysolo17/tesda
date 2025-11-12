import { Injectable } from '@angular/core';
import {
  TransparencySeal,
  TransparencySealConverter,
} from '../models/TransparencySeal';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  FirestoreError,
  getDoc,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { C } from '@fullcalendar/core/internal-common';

@Injectable({
  providedIn: 'root',
})
export class TransparencySealService {
  private readonly TRANSPARENCY_SEAL_COLLECTION = 'transparency-seal';
  constructor(private firestore: Firestore) {}

  create(transparency: TransparencySeal) {
    const collectionRef = collection(
      this.firestore,
      this.TRANSPARENCY_SEAL_COLLECTION
    ).withConverter(TransparencySealConverter);
    const docRef = doc(collectionRef);
    transparency.id = docRef.id;
    return setDoc(docRef, transparency);
  }
  update(transparency: TransparencySeal) {
    const newData: TransparencySeal = {
      ...transparency,
      updatedAt: new Date(),
    };

    const docRef = doc(
      this.firestore,
      this.TRANSPARENCY_SEAL_COLLECTION,
      newData.id
    ).withConverter(TransparencySealConverter);

    return updateDoc(docRef, newData);
  }

  getAll(): Observable<TransparencySeal[]> {
    const q = query(
      collection(
        this.firestore,
        this.TRANSPARENCY_SEAL_COLLECTION
      ).withConverter(TransparencySealConverter),
      orderBy('createdAt', 'asc')
    );
    return collectionData(q);
  }
  delete(id: string) {
    return deleteDoc(
      doc(this.firestore, this.TRANSPARENCY_SEAL_COLLECTION, id)
    );
  }
  getById(id: string): Promise<TransparencySeal | null> {
    const docRef = doc(
      this.firestore,
      this.TRANSPARENCY_SEAL_COLLECTION,
      id
    ).withConverter(TransparencySealConverter);
    return getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          return docSnap.data();
        } else {
          return null;
        }
      })
      .catch((error) => {
        console.error(`Failed to fetch TransparencySeal ${id}:`, error);
        throw error;
      });
  }
}
