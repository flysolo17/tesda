import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTransparencySealComponent } from './admin-transparency-seal.component';

describe('AdminTransparencySealComponent', () => {
  let component: AdminTransparencySealComponent;
  let fixture: ComponentFixture<AdminTransparencySealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTransparencySealComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdminTransparencySealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
