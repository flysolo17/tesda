import { Injectable, Query } from '@angular/core';
import {
  collection,
  collectionData,
  CollectionReference,
  deleteDoc,
  doc,
  docData,
  Firestore,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  QueryConstraint,
  QueryDocumentSnapshot,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import {
  Appointment,
  AppointmentConverter,
  AppointmentStatus,
  buildUserNotification,
} from '../models/Appointment';

import { map, Observable } from 'rxjs';
import { generateRandomNumberWithDate } from '../utils/Constants';
import { Services } from '../models/Services';
import { EmailService } from './email.service';
import { NotificationService } from './notification.service';
import { Notification, NotificationType } from '../models/Notification';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly APPOINTMENT_COLLECTION = 'appointments';
  constructor(
    private firestore: Firestore,
    private emailService: EmailService,
    private notificationService: NotificationService
  ) {}
  async hasPendingAppointment(uid: string): Promise<boolean> {
    const q = query(
      collection(this.firestore, this.APPOINTMENT_COLLECTION),
      where('uid', '==', uid),
      where('status', 'in', [
        AppointmentStatus.PENDING,
        AppointmentStatus.CONFIRMED,
      ])
    );
    return getDocs(q).then((snapshot) => !snapshot.empty);
  }
  getByMonth(month: number, year: number = 2025): Observable<Appointment[]> {
    const start = new Date(year, month - 1, 1); // first day of month
    const end = new Date(year, month, 0); // last day of month

    const startStr = start.toISOString().split('T')[0]; // YYYY-MM-DD
    const endStr = end.toISOString().split('T')[0];

    const q = query(
      collection(this.firestore, this.APPOINTMENT_COLLECTION).withConverter(
        AppointmentConverter
      ),
      where('date', '>=', startStr),
      where('date', '<=', endStr),
      orderBy('date', 'asc'),
      orderBy('time', 'asc')
    );

    return collectionData(q);
  }

  getById(id: string): Observable<Appointment | null> {
    const docRef = doc(
      this.firestore,
      `${this.APPOINTMENT_COLLECTION}/${id}`
    ).withConverter(AppointmentConverter);
    return docData(docRef).pipe(map((e) => e ?? null));
  }
  async getAppointments(
    lastIndex: QueryDocumentSnapshot<Appointment> | null,
    status: AppointmentStatus,
    count: number
  ): Promise<Appointment[]> {
    const appointmentsRef = collection(
      this.firestore,
      this.APPOINTMENT_COLLECTION
    ).withConverter(AppointmentConverter);

    const constraints: QueryConstraint[] = [
      where('status', '==', status),
      orderBy('date', 'asc'),
      limit(count),
    ];

    if (lastIndex) {
      constraints.push(startAfter(lastIndex));
    }

    const q = query(appointmentsRef, ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => doc.data());
  }
  getAll(): Observable<Appointment[]> {
    const q = query(
      collection(this.firestore, this.APPOINTMENT_COLLECTION).withConverter(
        AppointmentConverter
      ),
      orderBy('date', 'asc')
    );
    return collectionData(q);
  }

  update(appointment: Appointment): Promise<void> {
    const docRef = doc(
      this.firestore,
      `${this.APPOINTMENT_COLLECTION}/${appointment.id}`
    );

    const data = {
      ...appointment,
      updatedAt: Timestamp.fromDate(new Date()),
    };

    return updateDoc(docRef, data);
  }

  create(appointment: Appointment) {
    appointment.id = generateRandomNumberWithDate();

    return setDoc(
      doc(
        collection(this.firestore, this.APPOINTMENT_COLLECTION),
        appointment.id
      ),
      appointment
    );
  }
  async reschedule(appointment: Appointment): Promise<void> {
    const batch = writeBatch(this.firestore);

    const appointmentRef = doc(
      this.firestore,
      this.APPOINTMENT_COLLECTION,
      appointment.id
    );

    batch.update(appointmentRef, {
      ...appointment,
      updatedAt: serverTimestamp(),
    });

    const notificationRef = doc(collection(this.firestore, 'notifications'));
    const notification: Notification = {
      id: notificationRef.id,
      type: NotificationType.APPOINTMENT,
      title: 'Appointment Rescheduled',
      body: `Your appointment for ${appointment.serviceInformation.name} on ${appointment.date} at ${appointment.time} has been rescheduled.`,
      recievers: [appointment.uid],
      seen: [],
      returnUrl: `/landing-page/appointments?id=${appointment.uid}`,
      createdAt: new Date(),
    };

    batch.set(notificationRef, notification);

    // 3. Commit batch + send email
    return Promise.all([
      batch.commit(),
      this.emailService.rescheduled(appointment),
    ]).then(() => {
      // All succeeded
      return;
    });
  }

  // DELETE
  delete(id: string) {
    const docRef = doc(this.firestore, `${this.APPOINTMENT_COLLECTION}/${id}`);
    return deleteDoc(docRef);
  }

  /**
   * Update the status of an appointment
   * @param id Appointment ID
   * @param status New status (AppointmentStatus)
   */
  updateStatus(appointment: Appointment, status: AppointmentStatus) {
    const docRef = doc(
      this.firestore,
      `${this.APPOINTMENT_COLLECTION}/${appointment.id}`
    );

    // Update Firestore first
    const updatePromise = updateDoc(docRef, {
      notes: appointment.notes,
      status,
      updatedAt: Timestamp.fromDate(new Date()),
    });
    const userNotification = buildUserNotification(appointment);

    // Send email notification after update
    updatePromise
      .then(() => {
        if (status === AppointmentStatus.CONFIRMED) {
          this.emailService.confirmed(appointment);
        } else if (status === AppointmentStatus.REJECTED) {
          this.emailService.reject(appointment);
        } else if (status === AppointmentStatus.CANCELLED) {
          this.emailService.cancelled(appointment);
        }
      })
      .then(() => {
        this.notificationService.createCustomNotification(
          userNotification,
          null
        );
      });

    return updatePromise;
  }
  getAppointmentsByUID(uid: string) {
    const q = query(
      collection(this.firestore, this.APPOINTMENT_COLLECTION).withConverter(
        AppointmentConverter
      ),
      where('uid', '==', uid),
      orderBy('updatedAt', 'desc')
    );
    return collectionData(q);
  }
  getAllAppointments(): Promise<Appointment[]> {
    const q = query(
      collection(this.firestore, this.APPOINTMENT_COLLECTION).withConverter(
        AppointmentConverter
      ),
      orderBy('date', 'asc')
    );

    return getDocs(q).then((snapshot) =>
      snapshot.docs.map((doc) => doc.data())
    );
  }

  async onDateChange(date: string): Promise<string[]> {
    const q = query(
      collection(this.firestore, this.APPOINTMENT_COLLECTION).withConverter(
        AppointmentConverter
      ),
      where('date', '==', date),
      where('status', 'in', [
        AppointmentStatus.PENDING,
        AppointmentStatus.CONFIRMED,
      ]),
      limit(10)
    );

    return getDocs(q).then((snapshot) =>
      snapshot.docs.map((doc) => doc.data()).map((e) => e.time)
    );
  }

  cancel(appointment: Appointment) {
    const batch = writeBatch(this.firestore);

    // 1. Update appointment status
    const appointmentRef = doc(
      this.firestore,
      this.APPOINTMENT_COLLECTION,
      appointment.id
    );
    batch.update(appointmentRef, {
      status: AppointmentStatus.CANCELLED,
      updatedAt: new Date(),
    });

    // 2. Create notification
    const notification: Notification = {
      id: '', // Firestore will generate if you use addDoc, but for batch we need a doc ref
      type: NotificationType.APPOINTMENT,
      title: 'Appointment Cancelled',
      body: `Your appointment for ${appointment.serviceInformation.name} on ${appointment.date} at ${appointment.time} has been cancelled.`,
      recievers: [appointment.uid],
      seen: [],
      returnUrl: `/landing-page/appointments?id=${appointment.uid}`,
      createdAt: new Date(),
    };

    const notifRef = doc(collection(this.firestore, 'notifications'));
    batch.set(notifRef, notification);

    // 3. Commit batch
    return batch.commit();
  }
}
