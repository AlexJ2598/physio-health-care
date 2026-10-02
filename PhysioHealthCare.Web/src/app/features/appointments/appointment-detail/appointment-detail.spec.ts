import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AppointmentService } from '../../../core/services/appointment';
import { ToastService } from '../../../core/services/toast';
import { TranslationService } from '../../../core/services/translation';
import { Appointment } from '../../../shared/models/appointment';
import { AppointmentDetail } from './appointment-detail';

describe('AppointmentDetail', () => {
  let component: AppointmentDetail;
  let fixture: ComponentFixture<AppointmentDetail>;
  let getById: ReturnType<typeof vi.fn>;

  const appointment: Appointment = {
    id: 'appointment-1',
    patientId: 'patient-1',
    patientName: 'Test patient',
    appointmentDate: '2026-10-02T18:00:00Z',
    reason: 'Follow-up',
    notes: null,
    status: 'Scheduled',
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    wasAutomaticallyCancelled: false,
  };

  beforeEach(async () => {
    getById = vi.fn().mockReturnValue(of(appointment));

    await TestBed.configureTestingModule({
      imports: [AppointmentDetail],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: appointment.id }) },
          },
        },
        {
          provide: AppointmentService,
          useValue: { getById },
        },
        {
          provide: TranslationService,
          useValue: {
            translate: (key: string) => key,
            getCurrentLanguage: () => 'en',
          },
        },
        {
          provide: ToastService,
          useValue: { success: vi.fn(), error: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(getById).toHaveBeenCalledWith(appointment.id);
    expect(component.appointment).toEqual(appointment);
    expect(fixture.nativeElement.querySelector('.appointment-detail-card')?.textContent).toContain(
      appointment.patientName,
    );
  });
});
