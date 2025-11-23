import { QueryDocumentSnapshot } from '@angular/fire/firestore';

export interface User {
  id: string;
  profile?: string | null;
  type: UserType;
  name: string;
  email: string;
  gender: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
  fcmToken?: string | null;
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
