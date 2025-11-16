import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

export interface Activity {
  id: string;
  image: string;
  title: string;
  location: string;
  description: string;
  date: string;
  time: string;
  createdAt: Date;
  updatedAt: Date;
  sortableDate: Date;
}

export const ActivityConverter = {
  toFirestore: (data: Activity) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as Activity;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    data.sortableDate = (data.sortableDate as any).toDate();
    return data;
  },
};
