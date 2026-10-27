import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicalHistoryForm } from './clinical-history-form';

describe('ClinicalHistoryForm', () => {
  let component: ClinicalHistoryForm;
  let fixture: ComponentFixture<ClinicalHistoryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalHistoryForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicalHistoryForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
