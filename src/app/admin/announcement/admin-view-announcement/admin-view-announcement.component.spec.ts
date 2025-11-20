import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewAnnouncementComponent } from './admin-view-announcement.component';

describe('AdminViewAnnouncementComponent', () => {
  let component: AdminViewAnnouncementComponent;
  let fixture: ComponentFixture<AdminViewAnnouncementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminViewAnnouncementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminViewAnnouncementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
