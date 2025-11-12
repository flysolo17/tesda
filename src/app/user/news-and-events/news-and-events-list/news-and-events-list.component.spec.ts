import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsAndEventsListComponent } from './news-and-events-list.component';

describe('NewsAndEventsListComponent', () => {
  let component: NewsAndEventsListComponent;
  let fixture: ComponentFixture<NewsAndEventsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsAndEventsListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewsAndEventsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
