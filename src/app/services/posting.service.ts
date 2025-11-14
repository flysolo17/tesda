import { Injectable } from '@angular/core';
import { PhilGEPS, PhilGEPSConverter } from '../models/PhilGEPS';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  Storage,
} from '@angular/fire/storage';
import { FileAttachmentService } from './file-attachment.service';
import {
  FileAttachmentConverter,
  FileAttachments,
} from '../models/TransparencySeal';

export interface PhilGEPSWithAttachments {
  philgeps: PhilGEPS;
  attachments: FileAttachments[];
}
@Injectable({
  providedIn: 'root',
})
export class PostingService {
  private readonly PHIL_GEPS_COLLECTION = 'philgeps-postings';

  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private attachmentService: FileAttachmentService
  ) {}

  async getById(id: string): Promise<PhilGEPS | null> {
    const docRef = doc(this.firestore, this.PHIL_GEPS_COLLECTION, id);
    const snapshot = await getDoc(docRef);

    return snapshot.exists() ? (snapshot.data() as PhilGEPS) : null;
  }
  getWithAttachments(): Observable<PhilGEPSWithAttachments[]> {
    const q = query(
      collection(this.firestore, this.PHIL_GEPS_COLLECTION).withConverter(
        PhilGEPSConverter
      ),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }).pipe(
      switchMap((seals: PhilGEPS[]) => {
        const combined$ = seals.map((seal) =>
          this.attachmentService.getAllByTransparencyId(seal.id).pipe(
            map((attachments) => ({
              philgeps: seal,
              attachments,
            }))
          )
        );
        return combineLatest(combined$);
      })
    );
  }
  getAll(): Observable<PhilGEPS[]> {
    const q = query(
      collection(this.firestore, this.PHIL_GEPS_COLLECTION).withConverter(
        PhilGEPSConverter
      ),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q);
  }

  create(philgeps: PhilGEPS) {
    const collectionRef = collection(
      this.firestore,
      this.PHIL_GEPS_COLLECTION
    ).withConverter(PhilGEPSConverter);

    philgeps.createdAt = new Date();
    philgeps.updatedAt = new Date();

    return setDoc(doc(collectionRef, philgeps.id), philgeps);
  }

  update(philgeps: PhilGEPS) {
    const docRef = doc(
      collection(this.firestore, this.PHIL_GEPS_COLLECTION).withConverter(
        PhilGEPSConverter
      ),
      philgeps.id
    );

    philgeps.updatedAt = new Date();
    return updateDoc(docRef, philgeps);
  }

  async delete(philgeps: PhilGEPS) {
    const attachmentsQuery = query(
      collection(this.firestore, 'attachments').withConverter(
        FileAttachmentConverter
      ),
      where('transparencyId', '==', philgeps.id)
    );

    const attachmentsSnapshot = await getDocs(attachmentsQuery);

    const deletePromises: Promise<any>[] = [];

    attachmentsSnapshot.forEach((docSnap) => {
      const attachment = docSnap.data();
      const filePath = attachment.file || null;

      if (filePath) {
        const storageRef = ref(this.storage, filePath);
        deletePromises.push(deleteObject(storageRef));
      }

      deletePromises.push(
        deleteDoc(doc(this.firestore, 'attachments', attachment.id))
      );
    });

    deletePromises.push(
      deleteDoc(doc(this.firestore, this.PHIL_GEPS_COLLECTION, philgeps.id))
    );

    await Promise.all(deletePromises);
  }
}
