import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { Router } from '@angular/router';
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
  AppointmentCreateComponent
} from './appointment-create';
import {
  AppointmentService
} from '../../../core/services/appointment';
import {
  PatientService
} from '../../../core/services/patient';
import {
  ToastService
} from '../../../core/services/toast';
import {
  TranslationService
} from '../../../core/services/translation';

describe('AppointmentCreateComponent', () => {
  let component: AppointmentCreateComponent;
  let fixture: ComponentFixture<AppointmentCreateComponent>;

  let appointmentServiceMock: {
    create: ReturnType<typeof vi.fn>;
  };

  let patientServiceMock: {
    getAll: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  let toastServiceMock: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  let translationServiceMock: {
    language$: BehaviorSubject<string>;
    translate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    appointmentServiceMock = {
      create: vi.fn()
    };

    patientServiceMock = {
      getAll: vi.fn().mockReturnValue(
        of({
          items: [
            {
              id: 'patient-1',
              fullName: 'Juan Perez',
              birthDate: '1990-01-01',
              gender: 'Male',
              phoneNumber: '',
              email: ''
            }
          ],
          pageNumber: 1,
          pageSize: 100,
          totalCount: 1,
          totalPages: 1
        })
      )
    };

    routerMock = {
      navigate: vi.fn()
    };

    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };

    translationServiceMock = {
      language$: new BehaviorSubject<string>(
        'en'
      ),
      translate: vi.fn(
        (key: string) => key
      )
    };

    await TestBed.configureTestingModule({
      imports: [
        AppointmentCreateComponent
      ],
      providers: [
        {
          provide: AppointmentService,
          useValue: appointmentServiceMock
        },
        {
          provide: PatientService,
          useValue: patientServiceMock
        },
        {
          provide: Router,
          useValue: routerMock
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
        AppointmentCreateComponent,
        {
          set: {
            template: ''
          }
        }
      )
      .compileComponents();

    fixture = TestBed.createComponent(
      AppointmentCreateComponent
    );

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.patientId).toBe('');
    expect(component.appointmentDate).toBe('');
    expect(component.reason).toBe('');
    expect(component.notes).toBe('');

    expect(
      component.isLoadingPatients
    ).toBeFalsy();

    expect(
      component.isSaving
    ).toBeFalsy();

    expect(
      component.errorMessage
    ).toBe('');
  });

  it('should translate a key', () => {
    translationServiceMock.translate
      .mockReturnValue(
        'Translated text'
      );

    const result = component.t(
      'appointments.create.title'
    );

    expect(
      translationServiceMock.translate
    ).toHaveBeenCalledWith(
      'appointments.create.title'
    );

    expect(result).toBe(
      'Translated text'
    );
  });

  it('should load patients', () => {
    component.loadPatients();

    expect(
      patientServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      100,
      undefined,
      'fullName',
      'asc'
    );

    expect(
      component.patients
    ).toHaveLength(1);

    expect(
      component.patients[0].fullName
    ).toBe('Juan Perez');

    expect(
      component.isLoadingPatients
    ).toBeFalsy();
  });

  it('should show error when loading patients fails', () => {
    patientServiceMock.getAll
      .mockReturnValue(
        throwError(() => ({
          status: 500
        }))
      );

    component.loadPatients();

    expect(
      component.isLoadingPatients
    ).toBeFalsy();

    expect(
      component.errorMessage
    ).toBe(
      'appointments.create.loadPatientsError'
    );
  });

  it('should not create appointment when required fields are missing', () => {
    component.createAppointment();

    expect(
      toastServiceMock.error
    ).toHaveBeenCalledWith(
      'appointments.validation.requiredFields'
    );

    expect(
      appointmentServiceMock.create
    ).not.toHaveBeenCalled();
  });

  it('should create appointment successfully', () => {
    appointmentServiceMock.create
      .mockReturnValue(
        of({
          id: 'appointment-1',
          patientId: 'patient-1',
          patientName: 'Juan Perez',
          appointmentDate:
            '2026-09-28T15:45:00.000Z',
          reason: 'Initial assessment',
          notes: 'Lower back pain',
          status: 'Scheduled'
        })
      );

    component.patientId = 'patient-1';
    component.appointmentDate =
      '2026-09-28T09:45';
    component.reason =
      '  Initial assessment  ';
    component.notes =
      '  Lower back pain  ';

    component.createAppointment();

    expect(
      appointmentServiceMock.create
    ).toHaveBeenCalledTimes(1);

    const createdAppointment =
      appointmentServiceMock.create
        .mock.calls[0][0];

    expect(
      createdAppointment.patientId
    ).toBe('patient-1');

    expect(
      createdAppointment.appointmentDate
    ).toBe(
      new Date(
        '2026-09-28T09:45'
      ).toISOString()
    );

    expect(
      createdAppointment.reason
    ).toBe('Initial assessment');

    expect(
      createdAppointment.notes
    ).toBe('Lower back pain');

    expect(
      component.isSaving
    ).toBeFalsy();

    expect(
      toastServiceMock.success
    ).toHaveBeenCalledWith(
      'appointments.create.success'
    );

    expect(
      routerMock.navigate
    ).toHaveBeenCalledWith([
      '/appointments'
    ]);
  });

  it('should send undefined when notes are empty', () => {
    appointmentServiceMock.create
      .mockReturnValue(
        of({
          id: 'appointment-1',
          patientId: 'patient-1',
          patientName: 'Juan Perez',
          appointmentDate:
            '2026-09-28T15:45:00.000Z',
          reason: 'Assessment',
          notes: null,
          status: 'Scheduled'
        })
      );

    component.patientId = 'patient-1';
    component.appointmentDate =
      '2026-09-28T09:45';
    component.reason = 'Assessment';
    component.notes = '   ';

    component.createAppointment();

    const createdAppointment =
      appointmentServiceMock.create
        .mock.calls[0][0];

    expect(
      createdAppointment.notes
    ).toBeUndefined();
  });

  it('should show error when creation fails', () => {
    appointmentServiceMock.create
      .mockReturnValue(
        throwError(() => ({
          status: 500
        }))
      );

    component.patientId = 'patient-1';
    component.appointmentDate =
      '2026-09-28T09:45';
    component.reason =
      'Initial assessment';

    component.createAppointment();

    expect(
      component.isSaving
    ).toBeFalsy();

    expect(
      component.errorMessage
    ).toBe(
      'appointments.create.error'
    );

    expect(
      toastServiceMock.error
    ).toHaveBeenCalledWith(
      'appointments.create.error'
    );

    expect(
      routerMock.navigate
    ).not.toHaveBeenCalled();
  });
});