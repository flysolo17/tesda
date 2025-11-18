import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface Schedule {
  id: string;
  date: string; // 08/17/2000
  time: string; //11:30 AM
  slots: number;
  serviceId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ScheduleConverter = {
  toFirestore: (data: Schedule) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as Schedule;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};

export const TIME_ARRAY: string[] = [
  '08:00–09:00',
  '09:00–10:00',
  '10:00–11:00',
  '11:00–12:00',
  '12:00–13:00',
  '13:00–14:00',
  '14:00–15:00',
  '15:00–16:00',
  '16:00–17:00',
];
