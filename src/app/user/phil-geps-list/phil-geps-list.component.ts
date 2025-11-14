import { Component, OnInit } from '@angular/core';
import { PostingService } from '../../services/posting.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-phil-geps-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './phil-geps-list.component.html',
  styleUrl: './phil-geps-list.component.scss',
})
export class PhilGepsListComponent implements OnInit {
  postings$ = this.postingService.getWithAttachments();
  constructor(private postingService: PostingService) {}
  ngOnInit(): void {
    this.postings$.subscribe((data) => {
      console.log(data);
    });
  }
  getFilename(url: string): string | null {
    try {
      const pathname = new URL(url, window.location.origin).pathname;
      const segments = pathname.split('/');
      return segments.pop() || null;
    } catch {
      return null;
    }
  }
}
