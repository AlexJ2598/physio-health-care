import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  BehaviorSubject,
  of,
  throwError
} from 'rxjs';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  AppointmentEditComponent
} from './appointment-edit';

import {
  AppointmentService
} from '../../../core/services/appointment';

import {
  ToastService
} from '../../../core/services/toast';

import {
  TranslationService
} from '../../../core/services/translation';

import {
  Appointment
} from '../../../shared/models/appointment';

describe('AppointmentEditComponent', () => {
  let component: AppointmentEditComponent;

  let fixture:
    ComponentFixture<AppointmentEditComponent>;

  let appointmentServiceMock: {
    getById: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  let toastServiceMock: {
    success: ReturnType<typeof vi.fn>;
  };

  let translationServiceMock: {
    language$: BehaviorSubject<'en' | 'es'>;
    translate: ReturnType<typeof vi.fn>;
  };

  const appointment: Appointment = {
    id: 'appointment-1',
    patientId: 'patient-1',
    patientName: 'John Doe',
    appointmentDate:
      '2026-09-25T19:30:00.000Z',
    reason: 'Initial assessment',
    notes: 'Test notes',
    status: 'Scheduled'
  };

  beforeEach(async () => {
    appointmentServiceMock = {
      getById: vi.fn(
        () => of(appointment)
      ),
      update: vi.fn(
        () => of(appointment)
      )
    };

    routerMock = {
      navigate: vi.fn()
    };

    toastServiceMock = {
      success: vi.fn()
    };

    translationServiceMock = {
      language$:
        new BehaviorSubject<'en' | 'es'>(
          'en'
        ),
      translate: vi.fn(
        (key: string) => key
      )
    };

    await TestBed.configureTestingModule({
      imports: [
        AppointmentEditComponent
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: vi.fn(
                  (key: string) =>
                    key === 'id'
                      ? 'appointment-1'
                      : null
                )
              }
            }
          }
        },
        {
          provide: Router,
          useValue: routerMock
        },
        {
          provide: AppointmentService,
          useValue: appointmentServiceMock
        },
        {
          provide: ToastService,
          useValue: toastServiceMock
        },
        {
          provide: TranslationService,
          useValue: translationServiceMock
        }
      ]
    })
      .overrideComponent(
        AppointmentEditComponent,
        {
          set: {
            template: ''
          }
        }
      )
      .compileComponents();

    fixture = TestBed.createComponent(
      AppointmentEditComponent
    );

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointment on init', () => {
    component.ngOnInit();

    expect(
      component.appointmentId
    ).toBe(
      'appointment-1'
    );

    expect(
      appointmentServiceMock.getById
    ).toHaveBeenCalledWith(
      'appointment-1'
    );

    expect(
      component.patientName
    ).toBe(
      'John Doe'
    );

    expect(
      component.reason
    ).toBe(
      'Initial assessment'
    );

    expect(
      component.notes
    ).toBe(
      'Test notes'
    );

    expect(
      component.appointmentDate
    ).toBe(
      toLocalDateTimeInput(
        appointment.appointmentDate
      )
    );

    expect(
      component.isLoading
    ).toBeFalsy();
  });

  it('should translate a key', () => {
    translationServiceMock.translate
      .mockReturnValue(
        'Edit appointment'
      );

    const result = component.t(
      'appointments.edit.title'
    );

    expect(
      translationServiceMock.translate
    ).toHaveBeenCalledWith(
      'appointments.edit.title'
    );

    expect(result).toBe(
      'Edit appointment'
    );
  });

  it('should navigate to not found when appointment does not exist', () => {
    appointmentServiceMock.getById
      .mockReturnValue(
        throwError(() => ({
          status: 404
        }))
      );

    component.appointmentId =
      'appointment-1';

    component.loadAppointment();

    expect(
      routerMock.navigate
    ).toHaveBeenCalledWith([
      '/not-found'
    ]);
  });

  it('should show error when loading appointment fails', () => {
    appointmentServiceMock.getById
      .mockReturnValue(
        throwError(() => ({
          status: 500
        }))
      );

    component.appointmentId =
      'appointment-1';

    component.loadAppointment();

    expect(
      component.isLoading
    ).toBeFalsy();

    expect(
      component.errorMessage
    ).toBe(
      'appointments.edit.loadError'
    );
  });

  it('should validate required fields', () => {
    component.appointmentId =
      'appointment-1';

    component.appointmentDate = '';
    component.reason = '';

    component.updateAppointment();

    expect(
      component.formSubmitted
    ).toBeTruthy();

    expect(
      component.errorMessage
    ).toBe(
      'appointments.validation.requiredFields'
    );

    expect(
      appointmentServiceMock.update
    ).not.toHaveBeenCalled();
  });

  it('should not update while already saving', () => {
    component.appointmentId =
      'appointment-1';

    component.appointmentDate =
      '2026-09-25T13:30';

    component.reason =
      'Initial assessment';

    component.isSaving = true;

    component.updateAppointment();

    expect(
      appointmentServiceMock.update
    ).not.toHaveBeenCalled();
  });

  it('should update appointment successfully', () => {
    component.appointmentId =
      'appointment-1';

    component.appointmentDate =
      '2026-09-25T13:30';

    component.reason =
      '  Follow-up assessment  ';

    component.notes =
      '  Updated notes  ';

    appointmentServiceMock.update
      .mockReturnValue(
        of(appointment)
      );

    component.updateAppointment();

    expect(
      appointmentServiceMock.update
    ).toHaveBeenCalledWith(
      'appointment-1',
      {
        appointmentDate:
          new Date(
            '2026-09-25T13:30'
          ).toISOString(),
        reason:
          'Follow-up assessment',
        notes:
          'Updated notes'
      }
    );

    expect(
      component.isSaving
    ).toBeFalsy();

    expect(
      toastServiceMock.success
    ).toHaveBeenCalledWith(
      'appointments.edit.success'
    );

    expect(
      routerMock.navigate
    ).toHaveBeenCalledWith([
      '/appointments'
    ]);
  });

  it('should send undefined when notes are empty', () => {
    component.appointmentId =
      'appointment-1';

    component.appointmentDate =
      '2026-09-25T13:30';

    component.reason =
      'Follow-up assessment';

    component.notes = '   ';

    component.updateAppointment();

    expect(
      appointmentServiceMock.update
    ).toHaveBeenCalledWith(
      'appointment-1',
      {
        appointmentDate:
          new Date(
            '2026-09-25T13:30'
          ).toISOString(),
        reason:
          'Follow-up assessment',
        notes: undefined
      }
    );
  });

  it('should show API error message when update fails', () => {
    appointmentServiceMock.update
      .mockReturnValue(
        throwError(() => ({
          error: {
            message:
              'Appointment could not be updated'
          }
        }))
      );

    component.appointmentId =
      'appointment-1';

    component.appointmentDate =
      '2026-09-25T13:30';

    component.reason =
      'Follow-up assessment';

    component.updateAppointment();

    expect(
      component.isSaving
    ).toBeFalsy();

    expect(
      component.errorMessage
    ).toBe(
      'Appointment could not be updated'
    );
  });

  it('should use translated fallback when API error has no message', () => {
    appointmentServiceMock.update
      .mockReturnValue(
        throwError(() => ({
          error: {}
        }))
      );

    component.appointmentId =
      'appointment-1';

    component.appointmentDate =
      '2026-09-25T13:30';

    component.reason =
      'Follow-up assessment';

    component.updateAppointment();

    expect(
      component.errorMessage
    ).toBe(
      'appointments.edit.error'
    );
  });

  function toLocalDateTimeInput(
    utcDate: string
  ): string {
    const date = new Date(utcDate);

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    const hours =
      String(
        date.getHours()
      ).padStart(2, '0');

    const minutes =
      String(
        date.getMinutes()
      ).padStart(2, '0');

    return (
      `${year}-${month}-${day}` +
      `T${hours}:${minutes}`
    );
  }
});