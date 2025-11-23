import { Injectable } from '@angular/core';
import { Announcement, AnnouncementConverter } from '../models/Announcement';
import {
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  getDoc,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';
import {
  AudienceType,
  Notification,
  NotificationType,
} from '../models/Notification';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private readonly ANNOUNCEMENT_COLLECTION = 'announcemets';
  private readonly NOTIFICATION_COLLECTION = 'notifications';

  constructor(
    private firestore: Firestore,
    private storage: Storage,
    private notificationService: NotificationService
  ) {}

  async create(announcement: Announcement, image: File): Promise<void> {
    try {
      // References
      const announcementCollection = collection(
        this.firestore,
        this.ANNOUNCEMENT_COLLECTION
      );
      const announcementDoc = doc(announcementCollection, announcement.id);

      // Upload image
      const imageRef = ref(
        this.storage,
        `${this.ANNOUNCEMENT_COLLECTION}/${announcementDoc.id}_${image.name}`
      );
      const uploadResult = await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      // Build announcement payload
      const now = new Date();
      const payload: Announcement = {
        ...announcement,
        id: announcementDoc.id,
        image: imageUrl,
        createdAt: now,
        updatedAt: now,
      };

      // Build notification payload
      const notificationCollection = collection(
        this.firestore,
        this.NOTIFICATION_COLLECTION
      );
      const notificationDoc = doc(notificationCollection);

      // Batch write for atomicity
      const batch = writeBatch(this.firestore);
      batch.set(announcementDoc, payload);

      await batch.commit();
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  async edit(announcement: Announcement, image: File | null): Promise<void> {
    try {
      const docRef = doc(
        this.firestore,
        this.ANNOUNCEMENT_COLLECTION,
        announcement.id
      );
      let imageUrl = announcement.image;

      if (image) {
        const imageRef = ref(
          this.storage,
          `${this.ANNOUNCEMENT_COLLECTION}/${announcement.id}_${image.name}`
        );
        const uploadResult = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      const payload: Announcement = {
        ...announcement,
        image: imageUrl,
        updatedAt: new Date(),
      };

      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }
  getAllByType(type: Announcement['type']): Observable<Announcement[]> {
    const q = query(
      collection(this.firestore, this.ANNOUNCEMENT_COLLECTION).withConverter(
        AnnouncementConverter
      ),
      where('type', '==', type),
      orderBy('updatedAt', 'desc')
    );
    return collectionData(q);
  }
  getAll(): Observable<Announcement[]> {
    const q = query(
      collection(this.firestore, this.ANNOUNCEMENT_COLLECTION).withConverter(
        AnnouncementConverter
      ),

      orderBy('updatedAt', 'desc')
    );
    return collectionData(q);
  }
  getPartialAnnouncements() {
    const q = query(
      collection(this.firestore, this.ANNOUNCEMENT_COLLECTION).withConverter(
        AnnouncementConverter
      ),
      where('type', '==', 'announcement'),
      orderBy('updatedAt', 'desc'),
      limit(3)
    );
    return collectionData(q);
  }

  getAllPartialNewsAndEvents() {
    const q = query(
      collection(this.firestore, this.ANNOUNCEMENT_COLLECTION).withConverter(
        AnnouncementConverter
      ),
      where('type', '!=', 'announcement'),
      orderBy('updatedAt', 'desc'),
      limit(3)
    );
    return collectionData(q);
  }
  async getById(id: string): Promise<Announcement | null> {
    const snapshot = await getDoc(
      doc(this.firestore, this.ANNOUNCEMENT_COLLECTION, id).withConverter(
        AnnouncementConverter
      )
    );
    return snapshot.exists() ? snapshot.data() : null;
  }
  getAllNewsAndEvents() {
    const q = query(
      collection(this.firestore, this.ANNOUNCEMENT_COLLECTION).withConverter(
        AnnouncementConverter
      ),
      where('type', '!=', 'announcement'),
      orderBy('updatedAt', 'desc')
    );
    return collectionData(q);
  }
  async delete(announcement: Announcement): Promise<void> {
    const imageRef = ref(this.storage, announcement.image); // assumes you're using AngularFireStorage
    const docRef = doc(
      this.firestore,
      this.ANNOUNCEMENT_COLLECTION,
      announcement.id
    );

    try {
      await Promise.all([
        deleteObject(imageRef), // delete image from Firebase Storage
        deleteDoc(docRef), // delete announcement from Firestore
      ]);
      console.log(`Announcement "${announcement.title}" deleted successfully.`);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }
}
