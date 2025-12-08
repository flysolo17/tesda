import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOurStoryComponent } from './admin-our-story.component';

describe('AdminOurStoryComponent', () => {
  let component: AdminOurStoryComponent;
  let fixture: ComponentFixture<AdminOurStoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOurStoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminOurStoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
