import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export enum ProviderType {
  TTI = 'TESDA TRAINING INSTITUTE',
  TVI = 'TECHNICAL VOCATIONAL INSTITUTIONS',
}
export interface Provider {
  id: string;
  name: string;

  address: string;
  type: ProviderType;
  email: string;
  contactNumber: string;
  createdAt: Date;
  updatedAt: Date;
}
export const ProviderConverter = {
  toFirestore: (data: Provider) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as Provider;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};
