import { Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  Firestore,
  getDocs,
  orderBy,
  query,
  setDoc,
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

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly APPOINTMENT_COLLECTION = 'appointments';
  constructor(private firestore: Firestore) {}
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
  // READ SINGLE
  getById(id: string): Observable<Appointment | null> {
    const docRef = doc(
      this.firestore,
      `${this.APPOINTMENT_COLLECTION}/${id}`
    ).withConverter(AppointmentConverter);
    return docData(docRef).pipe(map((e) => e ?? null));
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
  updateStatus(id: string, status: AppointmentStatus) {
    const docRef = doc(this.firestore, `${this.APPOINTMENT_COLLECTION}/${id}`);
    return updateDoc(docRef, {
      status,
      updatedAt: Timestamp.fromDate(new Date()),
    });
  }
}
