import { Injectable } from '@angular/core';
import {
  FileAttachmentConverter,
  FileAttachments,
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
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { combineLatest, map, Observable, switchMap } from 'rxjs';
import { C } from '@fullcalendar/core/internal-common';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { FileAttachmentService } from './file-attachment.service';
export interface TransparencySealWithAttachments {
  transparencySeal: TransparencySeal;
  attachments: FileAttachments[];
}
@Injectable({
  providedIn: 'root',
})
export class TransparencySealService {
  private readonly TRANSPARENCY_SEAL_COLLECTION = 'transparency-seal';
  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private fileAttachmentService: FileAttachmentService
  ) {}

  create(transparency: TransparencySeal) {
    const collectionRef = collection(
      this.firestore,
      this.TRANSPARENCY_SEAL_COLLECTION
    ).withConverter(TransparencySealConverter);
    const docRef = doc(collectionRef, transparency.id);

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

  getWithAttachments(): Observable<TransparencySealWithAttachments[]> {
    const q = query(
      collection(
        this.firestore,
        this.TRANSPARENCY_SEAL_COLLECTION
      ).withConverter(TransparencySealConverter),
      orderBy('createdAt', 'asc')
    );

    return collectionData(q, { idField: 'id' }).pipe(
      switchMap((seals: TransparencySeal[]) => {
        const combined$ = seals.map((seal) =>
          this.fileAttachmentService.getAllByTransparencyId(seal.id).pipe(
            map((attachments) => ({
              transparencySeal: seal,
              attachments,
            }))
          )
        );
        return combineLatest(combined$);
      })
    );
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
  async delete(transparency: TransparencySeal): Promise<void> {
    const attachmentsQuery = query(
      collection(this.firestore, 'attachments').withConverter(
        FileAttachmentConverter
      ),
      where('transparencyId', '==', transparency.id)
    );

    const attachmentsSnapshot = await getDocs(attachmentsQuery);

    // Delete each attachment file from storage and its Firestore doc
    const deletePromises: Promise<any>[] = [];

    attachmentsSnapshot.forEach((docSnap) => {
      const attachment = docSnap.data();
      const filePath = attachment.file || null; // Ensure you store this during upload

      if (filePath) {
        const storageRef = ref(this.storage, filePath);
        deletePromises.push(deleteObject(storageRef));
      }

      deletePromises.push(
        deleteDoc(doc(this.firestore, 'attachments', attachment.id))
      );
    });

    // Delete the transparency seal document
    deletePromises.push(
      deleteDoc(
        doc(this.firestore, this.TRANSPARENCY_SEAL_COLLECTION, transparency.id)
      )
    );

    await Promise.all(deletePromises);
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
