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
  limit,
  orderBy,
  query,
  QueryConstraint,
  QueryDocumentSnapshot,
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
} from '../models/Appointment';

import { map, Observable } from 'rxjs';
import { generateRandomNumberWithDate } from '../utils/Constants';
import { Services } from '../models/Services';
import { EmailService } from './email.service';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly APPOINTMENT_COLLECTION = 'appointments';
  constructor(
    private firestore: Firestore,
    private emailService: EmailService
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

  // UPDATE
  update(appointment: Appointment) {
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
    const ref = collection(this.firestore, this.APPOINTMENT_COLLECTION);
    appointment.id = generateRandomNumberWithDate();

    return setDoc(doc(ref, appointment.id), appointment);
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

    // Send email notification after update
    updatePromise.then(() => {
      if (status === AppointmentStatus.CONFIRMED) {
        this.emailService.confirmed(appointment);
      } else if (status === AppointmentStatus.REJECTED) {
        this.emailService.reject(appointment);
      } else if (status === AppointmentStatus.CANCELLED) {
        this.emailService.cancelled(appointment);
      }
    });

    return updatePromise;
  }
}
