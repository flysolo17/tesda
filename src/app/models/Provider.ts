import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export enum ProviderType {
  TVET = 'TVET Programs & Assesment Centers',
  PROVINCIAL = 'Provincial Office External Services',
}
export interface Provider {
  id: string;
  name: string;
  region: string;
  province: string;
  address: string;
  file: string | null;
  requirements: string[];
  type: ProviderType;
  email: string;
  contactNumber: string;
  location?: {
    latitude: number;
    longitude: number;
  };
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
