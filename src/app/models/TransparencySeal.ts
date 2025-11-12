import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface TransparencySeal {
  id: string;
  title: string;
  quickLinks: QuickLink[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickLink {
  label: string;
  link: string;
}

export const TransparencySealConverter = {
  toFirestore: (data: TransparencySeal) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as TransparencySeal;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};
