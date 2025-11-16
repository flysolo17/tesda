import { Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from '@angular/fire/firestore';
import { Visitor, VisitorConverter } from '../models/Visitor';

@Injectable({
  providedIn: 'root',
})
export class VisitorLogService {
  private readonly VISITOR_LOG_COLLECTION = 'visitors';

  constructor(private firestore: Firestore) {}

  async checkIfUserLoggedToday(uid: string): Promise<boolean> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const visitorQuery = query(
      collection(this.firestore, this.VISITOR_LOG_COLLECTION).withConverter(
        VisitorConverter
      ),
      where('uid', '==', uid),
      where('loggedAt', '>=', Timestamp.fromDate(startOfDay)),
      where('loggedAt', '<=', Timestamp.fromDate(endOfDay))
    );

    const snapshot = await getDocs(visitorQuery);
    return !snapshot.empty;
  }

  async saveLog(uid: string): Promise<void> {
    try {
      const alreadyLogged = await this.checkIfUserLoggedToday(uid);
      if (!alreadyLogged) {
        const ref = doc(
          collection(this.firestore, this.VISITOR_LOG_COLLECTION)
        );
        const id = ref.id;

        const visit: Visitor = {
          id,
          loggedAt: new Date(),
          uid,
        };

        await setDoc(ref.withConverter(VisitorConverter), visit);
      }
    } catch (e) {
      console.error('Failed to save visitor log:', e);
    }
  }

  async visitorPerMonth(): Promise<VisitorPerMonth[]> {
    const now = new Date();
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(now.getMonth() - 3);

    const q = query(
      collection(this.firestore, this.VISITOR_LOG_COLLECTION).withConverter(
        VisitorConverter
      ),
      where('loggedAt', '>=', Timestamp.fromDate(fourMonthsAgo))
    );

    const snapshot = await getDocs(q);
    const grouped = new Map<string, Map<string, Visitor>>(); // key: month, value: Map<visitorId, Visitor>

    snapshot.forEach((doc) => {
      const visitor = doc.data();
      const ts = visitor.loggedAt;
      const uid = visitor.uid; // unique user identifier
      const year = ts.getFullYear().toString();
      const monthName = ts.toLocaleString('default', { month: 'short' }); // e.g., "Jan"
      const key = `${year}-${monthName}`;

      if (!grouped.has(key)) {
        grouped.set(key, new Map<string, Visitor>()); // Map<uid, Visitor>
      }

      const monthGroup = grouped.get(key)!;
      monthGroup.set(uid, visitor); // deduplicate by uid
    });

    const result: VisitorPerMonth[] = Array.from(grouped.entries()).map(
      ([key, visitorMap]) => {
        const [year, month] = key.split('-');
        const visitors = Array.from(visitorMap.values());
        return {
          year,
          month,
          visitors,
          count: visitors.length,
        };
      }
    );

    result.sort(
      (a, b) =>
        a.year.localeCompare(b.year) ||
        monthOrder(a.month) - monthOrder(b.month)
    );

    return result;
  }
}

export interface VisitorPerMonth {
  month: string;
  year: string;
  visitors: Visitor[];
  count: number;
}

// Helper to sort month names correctly
export function monthOrder(month: string): number {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return months.indexOf(month);
}
