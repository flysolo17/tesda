import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface Appointment {
  id: string;
  uid: string;
  personalInformation: PersonalInformation;
  serviceInformation: ServiceInformation;
  sid: string;
  date: string;
  time: string;
  location: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AppointmentConverter = {
  toFirestore: (data: Appointment) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as Appointment;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};

export interface PersonalInformation {
  name: string;
  email: string;
  contact: string;
}

export interface ServiceInformation {
  id: string;
  name: string;
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}
