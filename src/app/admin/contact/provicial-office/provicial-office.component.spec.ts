import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvicialOfficeComponent } from './provicial-office.component';

describe('ProvicialOfficeComponent', () => {
  let component: ProvicialOfficeComponent;
  let fixture: ComponentFixture<ProvicialOfficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProvicialOfficeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProvicialOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
