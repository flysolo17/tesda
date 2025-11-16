import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Activity, ActivityConverter } from '../models/Activity';

import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
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
export class ActivityService {
  private readonly ACTIVITY_COLLECTION = 'activities';
  constructor(private firestore: Firestore, private storage: Storage) {}

  async add(activity: Activity, image: File): Promise<void> {
    const extension = image.name.split('.').pop() || 'jpg';
    const random = crypto.randomUUID();
    const imagePath = `${this.ACTIVITY_COLLECTION}/${activity.id}/${random}.${extension}`;
    const imageRef = ref(this.storage, imagePath);

    await uploadBytes(imageRef, image);
    const imageUrl = await getDownloadURL(imageRef);

    const now = new Date();
    const newActivity: Activity = {
      ...activity,
      image: imageUrl,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(
      doc(this.firestore, this.ACTIVITY_COLLECTION, activity.id).withConverter(
        ActivityConverter
      ),
      newActivity
    );
  }

  async update(activity: Activity, image: File | null): Promise<void> {
    let imageUrl = activity.image;

    if (image) {
      const extension = image.name.split('.').pop() || 'jpg';
      const random = crypto.randomUUID();
      const imagePath = `${this.ACTIVITY_COLLECTION}/${activity.id}/${random}.${extension}`;
      const imageRef = ref(this.storage, imagePath);
      await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(imageRef);
    }

    const updatedActivity: Activity = {
      ...activity,
      image: imageUrl,
      updatedAt: new Date(),
    };

    await updateDoc(
      doc(this.firestore, this.ACTIVITY_COLLECTION, activity.id).withConverter(
        ActivityConverter
      ),
      updatedActivity
    );
  }

  async delete(activity: Activity): Promise<void> {
    // 1️⃣ Delete image from Firebase Storage if it exists
    if (activity.image) {
      const imageRef = ref(this.storage, activity.image);
      await deleteObject(imageRef);
    }

    // 2️⃣ Delete Firestore document
    await deleteDoc(doc(this.firestore, this.ACTIVITY_COLLECTION, activity.id));
  }

  getAll(): Observable<Activity[]> {
    const q = query(
      collection(this.firestore, this.ACTIVITY_COLLECTION).withConverter(
        ActivityConverter
      ),
      orderBy('sortableDate', 'asc')
    );
    return collectionData(q);
  }

  getById(id: string): Promise<Activity | null> {
    const docRef = doc(
      collection(this.firestore, this.ACTIVITY_COLLECTION).withConverter(
        ActivityConverter
      ),
      id
    );

    return getDoc(docRef).then((snapshot) => {
      if (snapshot.exists()) {
        return snapshot.data();
      } else {
        return null;
      }
    });
  }
}
