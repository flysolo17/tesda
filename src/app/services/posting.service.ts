import { Injectable } from '@angular/core';
import { PhilGEPS, PhilGEPSConverter } from '../models/PhilGEPS';
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
import { Observable } from 'rxjs';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  Storage,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class PostingService {
  private readonly PHIL_GEPS_COLLECTION = 'philgeps-postings';

  constructor(private firestore: Firestore, private storage: Storage) {}

  getAll(): Observable<PhilGEPS[]> {
    const q = query(
      collection(this.firestore, this.PHIL_GEPS_COLLECTION).withConverter(
        PhilGEPSConverter
      ),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q);
  }

  async create(philgeps: PhilGEPS, file?: File | null): Promise<boolean> {
    try {
      const collectionRef = collection(
        this.firestore,
        this.PHIL_GEPS_COLLECTION
      ).withConverter(PhilGEPSConverter);
      const docRef = doc(collectionRef);

      philgeps.id = docRef.id;
      philgeps.createdAt = new Date();
      philgeps.updatedAt = new Date();

      if (file) {
        const filePath = `philgeps/${docRef.id}/${file.name}`;
        const storageRef = ref(this.storage, filePath);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        philgeps.attachment = downloadURL; // store URL
      } else {
        philgeps.attachment = null;
      }

      await setDoc(docRef, philgeps);
      return true;
    } catch (error) {
      console.error('Error creating PhilGEPS posting:', error);
      return false;
    }
  }

  async update(philgeps: PhilGEPS, file?: File | null): Promise<boolean> {
    try {
      const docRef = doc(
        collection(this.firestore, this.PHIL_GEPS_COLLECTION).withConverter(
          PhilGEPSConverter
        ),
        philgeps.id
      );

      // Upload new file if provided
      if (file) {
        const filePath = `philgeps/${philgeps.id}/${file.name}`;
        const storageRef = ref(this.storage, filePath);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        philgeps.attachment = downloadURL;
      }

      philgeps.updatedAt = new Date();
      await updateDoc(docRef, philgeps);
      return true;
    } catch (error) {
      console.error('Error updating PhilGEPS posting:', error);
      return false;
    }
  }

  async delete(philgeps: PhilGEPS): Promise<boolean> {
    try {
      // Delete attachment from storage if exists
      if (philgeps.attachment) {
        const fileRef = ref(this.storage, philgeps.attachment);
        await deleteObject(fileRef).catch((err) =>
          console.warn('Failed to delete file:', err)
        );
      }

      const docRef = doc(
        this.firestore,
        this.PHIL_GEPS_COLLECTION,
        philgeps.id
      );
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting PhilGEPS posting:', error);
      return false;
    }
  }
}
