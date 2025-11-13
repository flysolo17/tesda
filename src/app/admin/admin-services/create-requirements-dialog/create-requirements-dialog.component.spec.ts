import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRequirementsDialogComponent } from './create-requirements-dialog.component';

describe('CreateRequirementsDialogComponent', () => {
  let component: CreateRequirementsDialogComponent;
  let fixture: ComponentFixture<CreateRequirementsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRequirementsDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateRequirementsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
