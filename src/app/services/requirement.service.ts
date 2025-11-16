import { Injectable } from '@angular/core';
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
  writeBatch,
} from '@angular/fire/firestore';
import { RequirementConverter, Requirements } from '../models/Requirement';
import { Observable } from 'rxjs';
import { write } from '@popperjs/core';
import {
  deleteObject,
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';
import Swal from 'sweetalert2';
import { an } from '@fullcalendar/core/internal-common';

@Injectable({
  providedIn: 'root',
})
export class RequirementService {
  private readonly REQUIREMENT_COLLECTION = 'requirements';
  constructor(private firestore: Firestore, private storage: Storage) {}

  async create(requirement: Requirements, file: File | null): Promise<boolean> {
    try {
      const collectionRef = collection(
        this.firestore,
        this.REQUIREMENT_COLLECTION
      );
      const docRef = doc(collectionRef);
      let filePath: string | null = null;
      if (file) {
        filePath = `requirements/${requirement.serviceId}/${docRef.id}/${file.name}`;
        const storageRef = ref(this.storage, filePath);
        await uploadBytes(storageRef, file);

        const downloadURL = await getDownloadURL(storageRef);
        requirement.file = downloadURL;
      } else {
        requirement.file = null;
      }
      requirement.id = docRef.id;
      requirement.createdAt = new Date();
      await setDoc(docRef, requirement);
      return true;
    } catch (error) {
      console.error('Error creating requirement:', error);
      return false;
    }
  }
  async delete(id: string, fileUrl?: string | null) {
    try {
      const tasks: Promise<any>[] = [];

      // 1. Delete Firestore document
      const docRef = doc(this.firestore, this.REQUIREMENT_COLLECTION, id);
      tasks.push(deleteDoc(docRef));

      // 2. Delete file from Storage if provided
      if (fileUrl) {
        const storageRef = ref(this.storage, fileUrl);
        tasks.push(deleteObject(storageRef));
      }

      // 3. Run both operations in parallel
      await Promise.all(tasks);

      // 4. Success notification
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Requirement and associated file have been deleted.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error('Delete failed', err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: err['message'] ?? 'Failed to delete requirement.',
      });
      throw err; // rethrow if you want calling code to handle it
    }
  }

  deleteAll(requirements: Requirements[]): Promise<boolean> {
    const batch = writeBatch(this.firestore);
    const storage = this.storage;

    return new Promise(async (resolve) => {
      try {
        for (const req of requirements) {
          if (req.file) {
            const fileRef = ref(storage, req.file);
            await deleteObject(fileRef);
          }
        }

        for (const req of requirements) {
          const docRef = doc(
            this.firestore,
            this.REQUIREMENT_COLLECTION,
            req.id
          );
          batch.delete(docRef);
        }

        // Step 3: Commit batch
        await batch.commit();

        resolve(true);
      } catch (error) {
        console.error('Error deleting requirements:', error);
        resolve(false);
      }
    });
  }
  getByServiceId(id: string): Observable<Requirements[]> {
    const q = query(
      collection(this.firestore, this.REQUIREMENT_COLLECTION).withConverter(
        RequirementConverter
      ),
      where('serviceId', '==', id),
      orderBy('createdAt', 'asc')
    );
    return collectionData(q);
  }
  getRequirements(id: string): Promise<Requirements[]> {
    const q = query(
      collection(this.firestore, this.REQUIREMENT_COLLECTION).withConverter(
        RequirementConverter
      ),
      where('serviceId', '==', id),
      orderBy('createdAt', 'desc')
    );

    return getDocs(q).then((snapshot) => {
      return snapshot.docs.map((doc) => doc.data());
    });
  }
}
