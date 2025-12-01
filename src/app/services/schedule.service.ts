import { Injectable } from '@angular/core';
import { Schedule, ScheduleConverter } from '../models/Schedule';
import {
  collection,
  collectionData,
  doc,
  Firestore,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { Services } from '../models/Services';
import { ProgramsService } from './programs.service';

export interface SchedulesPerDay {
  date: string;
  slots: string;
  schedules: Schedule[];
}

export interface ScheduleWithService {
  schedule: Schedule;
  service: Services | null;
}
@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private readonly SCHEDULE_COLLECTION = 'schedules';
  constructor(
    private firestore: Firestore,
    private programService: ProgramsService
  ) {}
  async getScheduleByDate(
    serviceId: string,
    date: string
  ): Promise<Schedule[]> {
    const q = query(
      collection(this.firestore, this.SCHEDULE_COLLECTION).withConverter(
        ScheduleConverter
      ),
      where('serviceId', '==', serviceId),
      where('date', '==', date)
    );
    return getDocs(q).then((snapshot) =>
      snapshot.docs.map((doc) => doc.data())
    );
  }
  deleteSchedules(schedules: Schedule[]) {
    const batch = writeBatch(this.firestore);
    schedules.forEach((e) => {
      batch.delete(doc(this.firestore, this.SCHEDULE_COLLECTION, e.id));
    });
    return batch.commit();
  }
  getAllScheduleWithServices(): Observable<ScheduleWithService[]> {
    const q = query(
      collection(this.firestore, this.SCHEDULE_COLLECTION).withConverter(
        ScheduleConverter
      ),
      orderBy('date', 'asc')
    );

    return collectionData(q).pipe(
      switchMap((schedules: Schedule[]) => {
        if (schedules.length === 0) return of([]);

        const enriched = schedules.map((schedule) =>
          this.programService.getById(schedule.serviceId).then((service) => ({
            schedule,
            service,
          }))
        );

        return forkJoin(enriched);
      })
    );
  }
  async create(schedule: Schedule): Promise<void> {
    const q = query(
      collection(this.firestore, this.SCHEDULE_COLLECTION).withConverter(
        ScheduleConverter
      ),
      where('serviceId', '==', schedule.serviceId),
      where('date', '==', schedule.date),
      where('time', '==', schedule.time),
      limit(1)
    );

    return getDocs(q).then((snapshot) => {
      if (!snapshot.empty) {
        // Schedule exists — increment slots
        const existingDoc = snapshot.docs[0];
        const existingSchedule = existingDoc.data();
        const updatedSlots =
          (existingSchedule.slots || 0) + (schedule.slots || 1);

        return updateDoc(existingDoc.ref, {
          slots: updatedSlots,
          updatedAt: new Date(),
        });
      } else {
        // Schedule doesn't exist — create new
        return setDoc(
          doc(this.firestore, this.SCHEDULE_COLLECTION, schedule.id),
          schedule
        );
      }
    });
  }

  updateSchedule(schedule: Schedule): Promise<void> {
    const { id, ...data } = schedule; // Exclude 'id' from the update payload
    const docRef = doc(this.firestore, this.SCHEDULE_COLLECTION, id);
    return updateDoc(docRef, data);
  }
  getScheduleByMonth(
    month: number,
    year: number = 2025
  ): Observable<SchedulesPerDay[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const startString = startDate.toISOString().split('T')[0];
    const endString = endDate.toISOString().split('T')[0];

    const q = query(
      collection(this.firestore, this.SCHEDULE_COLLECTION).withConverter(
        ScheduleConverter
      ),
      where('date', '>=', startString),
      where('date', '<=', endString),
      orderBy('date', 'asc')
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map((schedules) => {
        const grouped: Record<string, Schedule[]> = {};

        for (const s of schedules as Schedule[]) {
          if (!grouped[s.date]) grouped[s.date] = [];
          grouped[s.date].push(s);
        }

        return Object.entries(grouped).map(([date, list]) => ({
          date,
          slots: list.reduce((sum, sched) => sum + sched.slots, 0).toString(),
          schedules: list.sort((a, b) => a.time.localeCompare(b.time)),
        }));
      })
    );
  }
}
