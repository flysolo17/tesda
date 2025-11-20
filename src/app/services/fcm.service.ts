import { inject, Injectable } from '@angular/core';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FcmService {
  public message$: Observable<any>;
  constructor(private msg: Messaging) {
    Notification.requestPermission().then(
      (notificationPermissions: NotificationPermission) => {
        if (notificationPermissions === 'granted') {
          console.log('Notification permission granted.');
        } else if (notificationPermissions === 'denied') {
          console.log('Notification permission denied.');
        }
      }
    );
    navigator.serviceWorker
      .register('/assets/firebase-messaging-sw.js', {
        type: 'module',
      })
      .then((serviceWorkerRegistration) => {
        getToken(this.msg, {
          vapidKey: 'YOUR_VAPID_KEY_HERE',
          serviceWorkerRegistration,
        })
          .then((token) => {
            console.log('FCM Token:', token);
            // Store token in your backend or Firestore if needed
          })
          .catch((err) => {
            console.error('Error getting FCM token:', err);
          });
      });
    this.message$ = new Observable((sub) =>
      onMessage(this.msg, (msg) => sub.next(msg))
    ).pipe(
      tap((msg) => {
        console.log('Received foreground FCM message:', msg);
      })
    );
  }
  async deleteToken(): Promise<void> {}
}
