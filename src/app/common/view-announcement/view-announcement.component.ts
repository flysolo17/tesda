import { Component, inject, OnInit } from '@angular/core';
import { AnnouncementService } from '../../services/announcement.service';
import { ActivatedRoute } from '@angular/router';
import { Announcement } from '../../models/Announcement';
import { CommonModule } from '@angular/common';
import { CommentService } from '../../services/comment.service';
import { ToastrService } from '../../services/toastr.service';
import {
  FormControl,
  ReactiveFormsModule,
  Validators,
  ɵInternalFormsSharedModule,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { Comment } from '../../models/Comment';

@Component({
  selector: 'app-view-announcement',
  standalone: true,
  imports: [CommonModule, ɵInternalFormsSharedModule, ReactiveFormsModule],
  templateUrl: './view-announcement.component.html',
  styleUrl: './view-announcement.component.scss',
})
export class ViewAnnouncementComponent implements OnInit {
  private announcementService = inject(AnnouncementService);
  private activatedRoute = inject(ActivatedRoute);
  private commentService = inject(CommentService);
  private toastr = inject(ToastrService);

  announcement: Announcement | null = null;
  comments$!: Observable<Comment[]>; // 🔹 observable stream of comments
  newComment = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
  ]);
  isLoading = true;
  id: string | null = null;

  ngOnInit(): void {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.id) {
      this.loadAnnouncement(this.id);
      this.loadComments(this.id);
    } else {
      this.isLoading = false;
    }
  }

  /** 🔹 Fetch announcement details */
  async loadAnnouncement(id: string) {
    try {
      const data = await this.announcementService.getById(id);
      if (data.exists()) {
        this.announcement = data.data();
      }
    } catch (error) {
      this.toastr.showError('Failed to load announcement.');
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  /** 🔹 Load comments as a live observable stream */
  loadComments(id: string) {
    this.comments$ = this.commentService.getAll(id);
  }

  /** 🔹 Add new comment */
  async addComment() {
    if (this.newComment.invalid || !this.id) return;

    const message = this.newComment.value?.trim();
    if (!message) return;

    try {
      await this.commentService.addComment(this.id, message);
      this.toastr.showSuccess('Comment added successfully!');
      this.newComment.reset();
    } catch (error) {
      console.error('Error adding comment:', error);
      this.toastr.showError('Failed to post comment. Please try again.');
    }
  }

  isAnnouncement(type: string): boolean {
    return type === 'announcement';
  }
}
