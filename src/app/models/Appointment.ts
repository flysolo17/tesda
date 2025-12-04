import { QueryDocumentSnapshot } from '@angular/fire/firestore';
import { Notification, NotificationType } from './Notification';

export interface Appointment {
  id: string;
  uid: string;
  personalInformation: PersonalInformation;
  serviceInformation: ServiceInformation;
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

export function buildUserNotification(appointment: Appointment): Notification {
  const userID = appointment.uid;

  const userNotification: Notification = {
    id: '',
    type: NotificationType.APPOINTMENT,
    title: '',
    body: '',
    recievers: [userID],
    seen: [],
    returnUrl: `/landing-page/appointments?id=${userID}`,
    createdAt: new Date(),
  };

  switch (appointment.status) {
    case AppointmentStatus.CONFIRMED:
      userNotification.title = 'Appointment Confirmed';
      userNotification.body = `Your appointment for ${appointment.serviceInformation.name} on ${appointment.date} at ${appointment.time} has been confirmed.`;
      break;

    case AppointmentStatus.REJECTED:
      userNotification.title = 'Appointment Rejected';
      userNotification.body = `Your appointment for ${appointment.serviceInformation.name} on ${appointment.date} was rejected. Please contact support for details.`;
      break;

    case AppointmentStatus.CANCELLED:
      userNotification.title = 'Appointment Cancelled';
      userNotification.body = `Your appointment for ${appointment.serviceInformation.name} on ${appointment.date} has been cancelled.`;
      break;

    case AppointmentStatus.COMPLETED:
      userNotification.title = 'Appointment Completed';
      userNotification.body = `Your appointment for ${appointment.serviceInformation.name} on ${appointment.date} has been completed. Thank you!`;
      break;

    default:
      userNotification.title = 'Appointment Updated';
      userNotification.body = `Your appointment for ${appointment.serviceInformation.name} has been updated.`;
      break;
  }

  return userNotification;
}
