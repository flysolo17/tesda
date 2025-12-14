import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface User {
  id: string;
  profile?: string | null;
  type: UserType;
  name: string;
  email: string;
  gender: string;
  age: number;
  municipality: Municipality;
  createdAt: Date;
  updatedAt: Date;
  phone?: string | null;
  fcmToken?: string | null;
}

export enum Municipality {
  AbraDeIlog = 'Abra de Ilog',
  Mamburao = 'Mamburao', // provincial capital
  Paluan = 'Paluan',
  StaCruz = 'Santa Cruz',
  Sablayan = 'Sablayan',
  Calintaan = 'Calintaan',
  Rizal = 'Rizal',
  SanJose = 'San Jose',
  Looc = 'Looc',
  Lubang = 'Lubang',
  Tilik = 'Tilik',
}

export enum UserType {
  ADMIN = 'admin',
  USER = 'user',
}

export const UserConverter = {
  toFirestore: (data: User) => data,
  fromFirestore: (snap: QueryDocumentSnapshot) => {
    const data = snap.data() as User;
    data.createdAt = (data.createdAt as any).toDate();
    data.updatedAt = (data.updatedAt as any).toDate();
    return data;
  },
};
