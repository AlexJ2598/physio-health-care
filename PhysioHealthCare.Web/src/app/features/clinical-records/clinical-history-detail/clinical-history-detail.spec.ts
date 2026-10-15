import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClinicalHistoryDetail } from './clinical-history-detail';

describe('ClinicalHistoryDetail', () => {
  let component: ClinicalHistoryDetail;
  let fixture: ComponentFixture<ClinicalHistoryDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClinicalHistoryDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ClinicalHistoryDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
