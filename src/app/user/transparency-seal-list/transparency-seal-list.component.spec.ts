import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransparencySealListComponent } from './transparency-seal-list.component';

describe('TransparencySealListComponent', () => {
  let component: TransparencySealListComponent;
  let fixture: ComponentFixture<TransparencySealListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransparencySealListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransparencySealListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
