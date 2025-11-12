import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface OrganizationalStructure {
  id: string;
  title: string;
  description: string;
  embeddedHtml: string;
  createdAt: Date;
  updatedAt: Date;
}

export const OrganizationalStructureConvert = {
  toFirestore: (data: OrganizationalStructure) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as OrganizationalStructure;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};
