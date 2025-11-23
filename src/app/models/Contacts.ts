import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface Contact {
  id: string;
  name: string;
  institution: string;
  description: string;
  contact: string;
  email: string;
  type: ContactType;
  createdAt: Date;
  updatedAt: Date;
}
export enum ContactType {
  PROVINCIAL_OFFICE = 'Provincial Office',
  TESDA_TRAINING_INSTITUTIONS = 'Tesda Training Institutions (TTI)',
  TECHNICAL_VOCATIONAL_INSTITUTIONS = 'Technical Vocational Intitutions (TVI)',
}

export const ContactConverter = {
  toFirestore: (data: Contact) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as Contact;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};
