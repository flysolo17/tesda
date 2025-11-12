import { Injectable } from '@angular/core';
import { Announcement, AnnouncementConverter } from '../models/Announcement';
import {
  addDoc,
  collection,
  collectionData,
  doc,
  Firestore,
  getDoc,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from '@angular/fire/firestore';
import {
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  private readonly ANNOUNCEMENT_COLLECTION = 'announcemets';
  constructor(private firestore: Firestore, private storage: Storage) {}

  async create(announcement: Announcement, image: File): Promise<void> {
    try {
      const collectionRef = collection(
        this.firestore,
        this.ANNOUNCEMENT_COLLECTION
      );
      const docRef = doc(collectionRef);
      let imageUrl: string;

      const imageRef = ref(
        this.storage,
        `${this.ANNOUNCEMENT_COLLECTION}/${docRef.id}_${image.name}`
      );
      const uploadResult = await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(uploadResult.ref);

      const payload: Announcement = {
        ...announcement,
        id: docRef.id,
        image: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(docRef, payload);
    } catch (error) {
      console.error('Error creating announcement:', error);
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
  getById(id: string) {
    return getDoc(
      doc(this.firestore, this.ANNOUNCEMENT_COLLECTION, id).withConverter(
        AnnouncementConverter
      )
    );
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
}
