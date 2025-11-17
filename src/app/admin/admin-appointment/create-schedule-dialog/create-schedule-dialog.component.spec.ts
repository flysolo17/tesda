import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateScheduleDialogComponent } from './create-schedule-dialog.component';

describe('CreateScheduleDialogComponent', () => {
  let component: CreateScheduleDialogComponent;
  let fixture: ComponentFixture<CreateScheduleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateScheduleDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateScheduleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
