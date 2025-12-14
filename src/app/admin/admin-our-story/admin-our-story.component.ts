import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StoryService } from '../../services/story.service';
import { CreateStoryComponent } from './create-story/create-story.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-our-story',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-our-story.component.html',
  styleUrl: './admin-our-story.component.scss',
})
export class AdminOurStoryComponent {
  stories$ = this.storyService.getAll();
  constructor(
    private modalService: NgbModal,
    private storyService: StoryService
  ) {}

  create(id: string | null = null) {
    const modalRef = this.modalService.open(CreateStoryComponent);
    if (id) {
      modalRef.componentInstance.id = id;
    }
  }
}
