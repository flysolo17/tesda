import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminNewsAndEventsComponent } from './admin-news-and-events.component';

describe('AdminNewsAndEventsComponent', () => {
  let component: AdminNewsAndEventsComponent;
  let fixture: ComponentFixture<AdminNewsAndEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminNewsAndEventsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminNewsAndEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
