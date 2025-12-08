import { Component } from '@angular/core';
import { StoryService } from '../../services/story.service';
import { OurStory } from '../../models/OurStory';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-story-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './story-list.component.html',
  styleUrl: './story-list.component.scss',
})
export class StoryListComponent {
  stories: OurStory[] = [];
  activeIndex = 0;
  animationClass = '';

  constructor(private storyService: StoryService) {}

  ngOnInit(): void {
    this.storyService.getAll().subscribe((list) => {
      this.stories = list;
    });
  }

  get activeStory() {
    return this.stories[this.activeIndex];
  }

  next() {
    if (this.activeIndex < this.stories.length - 1) {
      this.animationClass = 'animate-right';
      setTimeout(() => {
        this.activeIndex++;
        this.clearAnimation();
      }, 500); // match animation duration
    }
  }

  prev() {
    if (this.activeIndex > 0) {
      this.animationClass = 'animate-left';
      setTimeout(() => {
        this.activeIndex--;
        this.clearAnimation();
      }, 500);
    }
  }

  private clearAnimation() {
    this.animationClass = '';
  }
}
