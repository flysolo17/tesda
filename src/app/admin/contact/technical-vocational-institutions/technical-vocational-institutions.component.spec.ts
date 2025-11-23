import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicalVocationalInstitutionsComponent } from './technical-vocational-institutions.component';

describe('TechnicalVocationalInstitutionsComponent', () => {
  let component: TechnicalVocationalInstitutionsComponent;
  let fixture: ComponentFixture<TechnicalVocationalInstitutionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicalVocationalInstitutionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TechnicalVocationalInstitutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
