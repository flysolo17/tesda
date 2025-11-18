import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface Services {
  id: string;
  title: string;
  description: string;
  qualification: string;
  type: ServiceType;

  createdAt: Date;
  updatedAt: Date;
}
export const ServicesConverter = {
  toFirestore: (data: Services) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as Services;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};
export enum ServiceType {
  G2C = 'G2C - Government to Citizen',
  G2B = 'G2B - Government to Business',
  G2G = 'G2G - Government to Government',
}
