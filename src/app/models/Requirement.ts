import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface Requirements {
  id: string;
  serviceId: string;
  requirement: string;
  whereToSecure: string;
  file?: string | null;
  createdAt: Date;
}

export const RequirementConverter = {
  toFirestore: (data: Requirements) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as Requirements;
    data.createdAt = (data.createdAt as any).toDate();

    return data;
  },
};
