import { inject, Injectable } from '@angular/core';
import { switchMap, of, shareReplay, map } from 'rxjs';
import { AuthService } from '../services/auth.service';
import {
  MessagingService,
  UnSeenMessages,
} from '../services/messaging.service';

@Injectable({
  providedIn: 'root',
})
export class MainStateService {
  private authService = inject(AuthService);
  private messageService = inject(MessagingService);

  readonly user$ = this.authService.getCurrentUser();

  readonly conversation$ = this.user$.pipe(
    switchMap(
      (user) =>
        user?.id
          ? this.messageService.getMyConvoWithAdmin(user)
          : of({ user: null, me: null, messages: [] }) // fallback Conversation
    ),
    shareReplay(1) // ✅ cache the latest value
  );
  readonly unseen$ = this.conversation$.pipe(
    map(
      (convo) =>
        convo.messages.filter(
          (msg) => !msg.seen && msg.receiverId === convo.me?.id
        ).length
    )
  );
}
