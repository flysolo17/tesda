import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from './services/auth.service';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { FcmService } from './services/fcm.service';
import { Auth, authState, onAuthStateChanged } from '@angular/fire/auth';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'tesda';
  private messaging = inject(Messaging);

  constructor(private modalService: NgbModal, private auth: Auth) {}

  ngOnInit(): void {
    authState(this.auth)
      .pipe(take(1))
      .subscribe((user) => {
        if (!user) return;

        this.registerServiceWorker()
          .then((registration) => {
            this.requestPermission(registration);
            this.listenForMessages();
          })
          .catch((err) => {
            console.error('Service worker registration failed:', err);
          });

        // TODO: Subscribe to user.id notifications from Firestore or backend
      });
  }

  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    return await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  }

  requestPermission(registration: ServiceWorkerRegistration) {
    if (Notification.permission === 'granted') {
      this.getFcmToken(registration);
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.getFcmToken(registration);
        } else {
          console.warn('Notification permission denied.');
        }
      });
    } else {
      console.warn(
        'Notification permission was blocked. Please enable it in browser settings.'
      );
    }
  }

  getFcmToken(registration: ServiceWorkerRegistration) {
    getToken(this.messaging, {
      vapidKey:
        'BL4xbxA5D98lAgFZ5FXSFzkUsWoHr0PPFUX2p0Fwfeh6UZTAlzQ4Vf2XfRxhl2g0HK6TJrNOoX9hTFhNxHR9Ikg',
      serviceWorkerRegistration: registration,
    })
      .then((token) => {
        console.log('Notification Token:', token);
        // TODO: Save token to Firestore or backend for user.id
      })
      .catch((err) => {
        console.error('FCM token error:', err);
      });
  }

  listenForMessages() {
    onMessage(this.messaging, (payload) => {
      console.log('Foreground message received:', payload);
      // TODO: Trigger modal, toast, or SweetAlert here
    });
  }
}
