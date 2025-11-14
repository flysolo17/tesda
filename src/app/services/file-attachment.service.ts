import { Injectable } from '@angular/core';
import {
  FileAttachmentConverter,
  FileAttachments,
} from '../models/TransparencySeal';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import {
  deleteObject,
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class FileAttachmentService {
  private readonly ATTACHMENT_COLLECTION = 'attachments';
  constructor(private firestore: Firestore, private storage: Storage) {}

  async create(attachment: FileAttachments, file: File | null) {
    const docRef = doc(collection(this.firestore, this.ATTACHMENT_COLLECTION));
    attachment.id = docRef.id;
    if (file) {
      const filePath = `${this.ATTACHMENT_COLLECTION}/${attachment.id}/${file.name}`;
      const storageRef = ref(this.storage, filePath);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      attachment.file = downloadURL;
    }
    attachment.createdAt = new Date();
    attachment.updatedAt = new Date();
    return setDoc(docRef, attachment);
  }
  async delete(id: string, filePath: string | null): Promise<void> {
    if (filePath) {
      const storageRef = ref(this.storage, filePath);
      await deleteObject(storageRef);
    }
    await deleteDoc(doc(this.firestore, this.ATTACHMENT_COLLECTION, id));
  }
  getAllByTransparencyId(id: string): Observable<FileAttachments[]> {
    const q = query(
      collection(this.firestore, this.ATTACHMENT_COLLECTION).withConverter(
        FileAttachmentConverter
      ),
      where('transparencyId', '==', id),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q);
  }

  private getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
  }
}
