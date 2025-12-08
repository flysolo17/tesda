import { Injectable } from '@angular/core';
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
import { OurStory, OurStoryConverter } from '../models/OurStory';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StoryService {
  private readonly storyCollection = collection(
    this.firestore,
    'stories'
  ).withConverter(OurStoryConverter);
  constructor(private firestore: Firestore, private storage: Storage) {}

  create(story: OurStory, video: File) {
    return new Promise<void>((resolve, reject) => {
      const docRef = doc(this.storyCollection);
      const videoRef = ref(this.storage, `stories/${docRef.id}_${video.name}`);

      // 1. Upload video
      uploadBytes(videoRef, video)
        .then(() => getDownloadURL(videoRef))
        .then((videoUrl) => {
          const now = new Date();

          // 2. Save document
          return setDoc(docRef, {
            ...story,
            id: docRef.id,
            videoUrl,
            createdAt: now,
            updatedAt: now,
          });
        })
        .then(() => resolve())
        .catch((error) => reject(error));
    });
  }

  update(story: OurStory, video: File | null) {
    return new Promise<void>((resolve, reject) => {
      const docRef = doc(this.storyCollection, story.id);

      // If NO new video → only update fields
      if (!video) {
        updateDoc(docRef, {
          ...story,
          updatedAt: new Date(),
        })
          .then(() => resolve())
          .catch((err) => reject(err));
        return;
      }

      // If new video is included → upload new, then update
      const videoRef = ref(this.storage, `stories/${story.id}_${video.name}`);

      uploadBytes(videoRef, video)
        .then(() => getDownloadURL(videoRef))
        .then((videoUrl) => {
          return updateDoc(docRef, {
            ...story,
            videoUrl,
            updatedAt: new Date(),
          });
        })
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  }

  delete(story: OurStory) {
    return new Promise<void>((resolve, reject) => {
      const docRef = doc(this.storyCollection, story.id);

      const tryDeleteFile = story.videoUrl
        ? deleteObject(ref(this.storage, story.videoUrl)).catch(() => {})
        : Promise.resolve();

      tryDeleteFile
        .then(() => deleteDoc(docRef))
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  }

  getAll(): Observable<OurStory[]> {
    const q = query(this.storyCollection, orderBy('createdAt', 'asc'));
    return collectionData(q);
  }
  getById(id: string) {
    return new Promise<OurStory | null>((resolve, reject) => {
      const docRef = doc(this.storyCollection, id);

      getDoc(docRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            resolve(snapshot.data() as OurStory);
          } else {
            resolve(null);
          }
        })
        .catch((err) => reject(err));
    });
  }
}
