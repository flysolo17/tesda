import { Injectable } from '@angular/core';
import {
  arrayUnion,
  collection,
  collectionData,
  doc,
  Firestore,
  getDocs,
  or,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import {
  AudienceType,
  Notification,
  NotificationConverter,
} from '../models/Notification';
import { Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly collectionRef = collection(
    this.firestore,
    'notifications'
  ).withConverter(NotificationConverter);
  constructor(private firestore: Firestore, private auth: Auth) {}

  async create(notification: Notification): Promise<void> {
    // Create a new doc reference
    const docRef = doc(this.collectionRef);
    notification.id = docRef.id;

    const snapshot = await getDocs(collection(this.firestore, 'users'));

    const userIds = snapshot.docs.map((doc) => doc.id);

    notification.recievers = userIds;

    await setDoc(docRef, notification);
  }
  async createCustomNotification(
    notification: Notification,
    adminNotification: Notification | null
  ): Promise<void> {
    const batch = writeBatch(this.firestore);
    const userDocRef = doc(this.collectionRef);
    notification.id = userDocRef.id;

    batch.set(userDocRef, notification);

    if (adminNotification) {
      const adminDocRef = doc(this.collectionRef);
      adminNotification.id = adminDocRef.id;

      batch.set(adminDocRef, adminNotification);
    }

    await batch.commit();
  }

  markAsSeen(notifications: string[]): Promise<void> {
    const batch = writeBatch(this.firestore);
    const uid = this.auth.currentUser?.uid;

    if (!uid) {
      console.warn('No authenticated user. Cannot mark notifications as seen.');
      return Promise.resolve();
    }
    notifications.forEach((id) => {
      const docRef = doc(this.collectionRef, id);
      batch.update(docRef, { seen: arrayUnion(uid) });
    });

    return batch.commit();
  }

  getAllUserNotification(id: string): Observable<Notification[]> {
    const q = query(
      this.collectionRef,
      where('receivers', 'array-contains', id),
      orderBy('createdAt', 'desc')
    );

    return collectionData(q, { idField: 'id' }) as Observable<Notification[]>;
  }

  getAllAdminNotification(id: string): Observable<Notification[]> {
    const q = query(
      this.collectionRef,
      where('receivers', 'array-contains', [id, 'admin']),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Notification[]>;
  }
}
