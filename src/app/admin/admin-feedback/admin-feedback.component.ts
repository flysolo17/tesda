import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FeedbackService } from '../../services/feedback.service';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';
import { Sentiment } from '../../models/Feedback';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-feedback.component.html',
  styleUrl: './admin-feedback.component.scss',
})
export class AdminFeedbackComponent implements OnInit {
  feedbacks$ = this.feedbackService.getAllFeedbacks();
  currentMonth = new Date().toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });
  stats = [
    { label: 'Total Feedbacks', value: 0, trend: '', trendClass: '' },
    { label: 'Positive', value: 0, trend: '', trendClass: 'text-success' },
    { label: 'Neutral', value: 0, trend: '', trendClass: 'text-warning' },
    { label: 'Negative', value: 0, trend: '', trendClass: 'text-danger' },
  ];

  constructor(private feedbackService: FeedbackService) {}
  ngOnInit(): void {
    this.feedbacks$
      .pipe(
        map((feedbacks) => {
          const total = feedbacks.length;
          const positive = feedbacks.filter(
            (f) =>
              f.sentiment === Sentiment.Satisfied ||
              f.sentiment === Sentiment.VerySatisfied
          ).length;
          const neutral = feedbacks.filter(
            (f) => f.sentiment === Sentiment.Neutral
          ).length;
          const negative = feedbacks.filter(
            (f) =>
              f.sentiment === Sentiment.Dissatisfied ||
              f.sentiment === Sentiment.VeryDissatisfied
          ).length;
          const avg = ((positive - negative) / total) * 100;

          this.stats = [
            {
              label: 'Total Feedbacks',
              value: total,
              trend: '',
              trendClass: '',
            },
            {
              label: 'Positive',
              value: positive,
              trend: '+',
              trendClass: 'text-success',
            },
            {
              label: 'Neutral',
              value: neutral,
              trend: '',
              trendClass: 'text-warning',
            },
            {
              label: 'Negative',
              value: negative,
              trend: '-',
              trendClass: 'text-danger',
            },
          ];
        })
      )
      .subscribe();
  }

  getSentimentClass(sentiment: Sentiment): string {
    switch (sentiment) {
      case Sentiment.VerySatisfied:
        return 'badge-very-satisfied';
      case Sentiment.Satisfied:
        return 'badge-satisfied';
      case Sentiment.Neutral:
        return 'badge-neutral';
      case Sentiment.Dissatisfied:
        return 'badge-dissatisfied';
      case Sentiment.VeryDissatisfied:
        return 'badge-very-dissatisfied';
      default:
        return 'badge-secondary';
    }
  }

  sentimentToBootstrapColor(sentiment: Sentiment): string {
    switch (sentiment) {
      case Sentiment.VeryDissatisfied:
        return 'danger'; // red
      case Sentiment.Dissatisfied:
        return 'warning'; // yellow/orange
      case Sentiment.Neutral:
        return 'secondary'; // gray
      case Sentiment.Satisfied:
        return 'info'; // light blue
      case Sentiment.VerySatisfied:
        return 'success'; // green
      default:
        return 'secondary';
    }
  }

  delete(id: string) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This feedback will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.feedbackService
          .delete(id)
          .then(() => {
            Swal.fire({
              title: 'Deleted!',
              text: 'The feedback has been removed.',
              icon: 'success',
              timer: 1200,
              showConfirmButton: false,
            });
          })
          .catch((err) => {
            Swal.fire({
              title: 'Error',
              text: 'Could not delete. Try again.',
              icon: 'error',
            });
          });
      }
    });
  }
}
