import { Injectable } from '@angular/core';
import { Conversation, Message, MessageConverter } from '../models/Message';
import {
  collection,
  collectionData,
  doc,
  docData,
  FieldValue,
  Firestore,
  getDoc,
  getDocs,
  limit,
  or,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { combineLatest, from, map, Observable, of, switchMap } from 'rxjs';
import { User, UserConverter, UserType } from '../models/Users';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  private readonly MESSAGES_COLLECTION = 'messages';
  constructor(private firestore: Firestore, private auth: Auth) {}
  updateUnseenMessages(ids: string[]): void {
    if (ids.length === 0) return;

    const batch = writeBatch(this.firestore);

    ids.forEach((id) => {
      const ref = doc(this.firestore, this.MESSAGES_COLLECTION, id);
      batch.update(ref, { seen: true });
    });

    batch
      .commit()
      .then(() => {
        console.log('Unseen messages updated.');
      })
      .catch((err) => {
        console.error('Failed to update unseen messages:', err);
      });
  }
  sendMessage(message: Message) {
    const messageRef = doc(
      collection(this.firestore, this.MESSAGES_COLLECTION).withConverter(
        MessageConverter
      )
    );
    message.id = messageRef.id;
    message.senderId = this.auth.currentUser?.uid ?? '';
    return setDoc(messageRef, message);
  }
  getMyConversations(): Observable<Message[]> {
    const uid = this.auth.currentUser?.uid;
    const messagesRef = collection(
      this.firestore,
      this.MESSAGES_COLLECTION
    ).withConverter(MessageConverter);

    const messagesQuery = query(
      messagesRef,
      or(where('senderId', '==', uid), where('receiverId', '==', uid)),
      orderBy('createdAt', 'desc')
    );

    return collectionData(messagesQuery);
  }

  getUnseenMessages(uid: string): Observable<Message[]> {
    const messagesRef = collection(
      this.firestore,
      this.MESSAGES_COLLECTION
    ).withConverter(MessageConverter);

    const q = query(
      messagesRef,
      where('receiverId', '==', uid),
      where('seen', '==', false),
      orderBy('createdAt', 'desc')
    );

    return collectionData(q, { idField: 'id' }) as Observable<Message[]>;
  }
  getGroupedUnseenMessages(uid: string): Observable<UnSeenMessages[]> {
    return this.getUnseenMessages(uid).pipe(
      map((messages) => {
        const groups: { [senderId: string]: Message[] } = {};

        messages.forEach((msg) => {
          if (!groups[msg.senderId]) {
            groups[msg.senderId] = [];
          }
          groups[msg.senderId].push(msg);
        });

        return Object.keys(groups).map((senderId) => ({
          senderId,
          messages: groups[senderId],
          count: groups[senderId].length,
        }));
      })
    );
  }
  getMyConvoWithAdmin(me: User): Observable<Conversation> {
    const adminQuery = query(
      collection(this.firestore, 'users').withConverter(UserConverter),
      where('type', '==', UserType.ADMIN),
      limit(1)
    );

    return collectionData(adminQuery, { idField: 'id' }).pipe(
      switchMap((admins: User[]) => {
        const admin = admins[0] || null;

        const messagesQuery = query(
          collection(this.firestore, this.MESSAGES_COLLECTION).withConverter(
            MessageConverter
          ),
          or(where('senderId', '==', me.id), where('receiverId', '==', me.id)),
          orderBy('createdAt', 'desc')
        );

        return collectionData(messagesQuery, { idField: 'id' }).pipe(
          map((messages) => ({
            user: admin,
            me: me,
            messages: messages,
          }))
        );
      })
    );
  }
}

export interface UnSeenMessages {
  senderId: string;
  messages: Message[];
  count: number;
}
