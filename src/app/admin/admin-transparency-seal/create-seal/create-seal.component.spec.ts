import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSealComponent } from './create-seal.component';

describe('CreateSealComponent', () => {
  let component: CreateSealComponent;
  let fixture: ComponentFixture<CreateSealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSealComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateSealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
