import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;

  recievers: string[];
  seen: string[];
  returnUrl: string;
  createdAt: Date;
}
export const NotificationConverter = {
  toFirestore: (data: Notification) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as Notification;
    data.createdAt = (data.createdAt as any).toDate();

    return data;
  },
};

export enum AudienceType {
  ALL = 'ALL',
  INDIVIDUAL = 'INDIVIDUAL',
  CUSTOM = 'CUSTOM',
}

export enum NotificationType {
  APPOINTMENT = 'Appointments',
  ACTIVITY = 'Activities',
  NEWS_AND_EVENTS = 'News & Events',
  CAREER = 'Careers',
  ANNOUNCEMENTS = 'Announcements',
  SERVICES = 'Services',
}
