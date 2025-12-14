import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface OurStory {
  id: string;
  title: string;
  videoUrl: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export const OurStoryConverter = {
  toFirestore: (data: OurStory) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as OurStory;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};
