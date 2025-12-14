import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { BannerService } from '../../../services/banner.service';
import { CommonModule } from '@angular/common';
import { AnnouncementListComponent } from '../announcement-list/announcement-list.component';
import { CalendarComponent } from '../../calendar/calendar.component';
import { Router, RouterModule } from '@angular/router';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../footer/footer.component';
import { NewsAndEventsComponent } from '../../../user/news-and-events/news-and-events.component';
import { User } from '../../../models/Users';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginDialogComponent } from '../../login-dialog/login-dialog.component';
import { RegisterDialogComponent } from '../../register-dialog/register-dialog.component';
import { FeedbackService } from '../../../services/feedback.service';
import { ForgotPasswordDialogComponent } from '../../forgot-password-dialog/forgot-password-dialog.component';
import { FeedbackDialogComponent } from '../../feedback-dialog/feedback-dialog.component';
import { MessagingService } from '../../../services/messaging.service';
import { ToastrService } from '../../../services/toastr.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MainStateService } from '../../../user/main-state.service';
import { take } from 'rxjs';
import { Message } from '../../../models/Message';
import { StoryListComponent } from '../../../user/story-list/story-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    AnnouncementListComponent,
    CalendarComponent,
    RouterLink,
    FooterComponent,
    FormsModule,
    ReactiveFormsModule,
    NewsAndEventsComponent,
    RouterModule,
    StoryListComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private state = inject(MainStateService);
  private messageService = inject(MessagingService);
  private toastr = inject(ToastrService);
  readonly convo$ = this.state.conversation$;

  messageText = new FormControl('');
  programs = [
    {
      title: 'TVET Programs',
      desc: 'Short-term courses focused on technical skills training.',
      icon: 'bi-tools',
      bg: '#e7f1ff',
      color: '#0d6efd',
    },
    {
      title: 'Assessment & Certification',
      desc: 'Evaluate your skills and gain national certification from TESDA. ',
      icon: 'bi-patch-check',
      bg: '#fff8e1',
      color: '#ffc107',
    },
  ];

  showMap: boolean = false; // 👈 ADDED HERE

  banners$ = this.bannerService.getAll();
  users$: User | null = null;

  constructor(
    private bannerService: BannerService,
    private authService: AuthService,
    private router: Router,
    private modalService: NgbModal,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((data) => {
      this.users$ = data;
    });
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
  book() {
    if (this.users$ === null) {
      Swal.fire({
        icon: 'warning',
        title: 'Login required',
        text: 'Please log in before booking.',
      });
      return;
    }
    this.router.navigate(['/landing-page/create-appointment'], {
      queryParams: { id: this.users$.id },
    });
  }

  get isLoggedIn(): boolean {
    return this.users$ !== null;
  }

  async openChatBox() {
    if (this.isLoggedIn) {
      document.getElementById('chatBox')?.classList.add('popup-open');
    } else {
      const modalRef = this.modalService.open(LoginDialogComponent);
      try {
        const uid = await modalRef.result;

        if (uid === 'register') {
          this.register();
        } else if (uid === 'forgotPassword') {
          this.openForgotPasswordDialog();
        } else {
          const shouldPrompt = !(await this.feedbackService.hasFeedback(uid));
          if (shouldPrompt) {
            this.openFeedbackDialog();
          }
        }
      } catch (err) {
        // modal dismissed or error — safely ignore or log
        console.warn('Login dialog closed without action', err);
      }
    }
  }
  register(): void {
    this.modalService.open(RegisterDialogComponent);
  }
  openForgotPasswordDialog(): void {
    this.modalService.open(ForgotPasswordDialogComponent);
  }
  openFeedbackDialog(): void {
    this.modalService.open(FeedbackDialogComponent, { size: 'lg' });
  }
}
