import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from './services/auth.service';
import { getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { FcmService } from './services/fcm.service';
import { Auth, authState, onAuthStateChanged } from '@angular/fire/auth';
import { take } from 'rxjs';
import Swal from 'sweetalert2';

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

  constructor(private auth: Auth, private authService: AuthService) {}

  ngOnInit(): void {
    authState(this.auth)
      .pipe(take(1))
      .subscribe(async (user) => {
        if (!user) return;

        try {
          const registration = await this.registerServiceWorker();
          this.handleNotificationPermission(registration, user.uid);
          this.listenForMessages();
        } catch (err) {
          console.error('Service worker registration failed:', err);
        }
      });
  }

  private async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    return await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  }

  private handleNotificationPermission(
    registration: ServiceWorkerRegistration,
    uid: string
  ) {
    if (Notification.permission === 'granted') {
      this.getFcmToken(registration, uid);
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          this.getFcmToken(registration, uid);
          Swal.fire({
            title: 'Notifications Enabled',
            text: 'You will now receive updates and reminders.',
            icon: 'success',
            confirmButtonColor: '#22c55e',
          });
        } else {
          Swal.fire({
            title: 'Permission Denied',
            text: 'You can enable notifications later in your browser settings.',
            icon: 'warning',
            confirmButtonColor: '#ef4444',
          });
        }
      });
    } else {
      Swal.fire({
        title: 'Notifications Blocked',
        text: 'Please enable notifications manually in your browser settings.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    }
  }

  private getFcmToken(registration: ServiceWorkerRegistration, uid: string) {
    getToken(this.messaging, {
      vapidKey:
        'BL4xbxA5D98lAgFZ5FXSFzkUsWoHr0PPFUX2p0Fwfeh6UZTAlzQ4Vf2XfRxhl2g0HK6TJrNOoX9hTFhNxHR9Ikg',
      serviceWorkerRegistration: registration,
    })
      .then((token) => {
        this.authService.updateFCMToken(uid, token);
        console.log('Notification Token:', token);
      })
      .catch((err) => {
        console.error('FCM token error:', err);
      });
  }

  private listenForMessages() {
    onMessage(this.messaging, (payload) => {
      console.log('Foreground message received:', payload);

      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'New Message', {
          body: payload.notification?.body || '',
          icon: payload.data?.['senderProfile'] ?? '/assets/images/logo.png',
          data: payload.data,
        });
      }
    });
  }
}
