import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TesdaTrainingInstituteComponent } from './tesda-training-institute.component';

describe('TesdaTrainingInstituteComponent', () => {
  let component: TesdaTrainingInstituteComponent;
  let fixture: ComponentFixture<TesdaTrainingInstituteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TesdaTrainingInstituteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TesdaTrainingInstituteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
