import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface PhilGEPS {
  id: string;
  title: string;
  cost: number;
  details: string;

  date: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PhilGEPSConverter = {
  toFirestore: (data: PhilGEPS) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as PhilGEPS;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};
