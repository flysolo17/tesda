import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface TransparencySeal {
  id: string;
  title: string;
  date: string;
  cost: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickLink {
  label: string;
  link: string;
}

export const TransparencySealConverter = {
  toFirestore: (data: TransparencySeal) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as TransparencySeal;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};

export interface FileAttachments {
  id: string;
  transparencyId: string;
  title: string;
  file?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const FileAttachmentConverter = {
  toFirestore: (data: FileAttachments) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as FileAttachments;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};
