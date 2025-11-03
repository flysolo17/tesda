import { Component, inject, OnInit } from '@angular/core';
import { MainStateService } from '../main-state.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessagingService } from '../../services/messaging.service';
import { ToastrService } from '../../services/toastr.service';
import { Message } from '../../models/Message';
import { take } from 'rxjs';

@Component({
  selector: 'app-user-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-messages.component.html',
  styleUrl: './user-messages.component.scss',
})
export class UserMessagesComponent implements OnInit {
  private state = inject(MainStateService);
  private messageService = inject(MessagingService);
  private toastr = inject(ToastrService);
  readonly convo$ = this.state.conversation$;

  messageText = new FormControl('');
  ngOnInit(): void {
    this.convo$.pipe(take(1)).subscribe((convo) => {
      const unseenIds = convo.messages
        .filter((msg) => !msg.seen && msg.receiverId === convo.me?.id)
        .map((msg) => msg.id);

      if (unseenIds.length > 0) {
        this.messageService.updateUnseenMessages(unseenIds);
      }
    });
  }
  sendMessage(): void {
    const text = this.messageText.value?.trim();
    if (!text) return;

    this.convo$.pipe(take(1)).subscribe((convo) => {
      if (!convo.me?.id || !convo.user?.id) {
        this.toastr.showError(
          'Cannot send message: missing sender or receiver.'
        );
        return;
      }

      const newMessage: Message = {
        id: '',
        message: text,
        senderId: convo.me.id,
        receiverId: convo.user.id,
        seen: false,
        createdAt: new Date(),
      };

      this.messageService
        .sendMessage(newMessage)
        .then(() => {
          this.messageText.reset();
          this.toastr.showSuccess('Message sent!');
        })
        .catch((err) => {
          console.error(err);
          this.toastr.showError('Failed to send message.');
        });
    });
  }
}
