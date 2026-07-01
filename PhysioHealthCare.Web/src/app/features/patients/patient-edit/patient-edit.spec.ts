import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientEditComponent } from './patient-edit';

describe('PatientEdit', () => {
  let component: PatientEditComponent;
  let fixture: ComponentFixture<PatientEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
