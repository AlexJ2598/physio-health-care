import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';

import {
  BehaviorSubject,
  of,
  Subject,
  throwError
} from 'rxjs';

import {
  provideRouter
} from '@angular/router';

import {
  AppointmentListComponent
} from './appointment-list';

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

import {
  PagedResult
} from '../../../shared/models/paged-result';

describe('AppointmentListComponent', () => {
  let component: AppointmentListComponent;

  let fixture:
    ComponentFixture<AppointmentListComponent>;

  let appointmentServiceMock: {
    getAll: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };

  let toastServiceMock: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  let translationServiceMock: {
    language$: BehaviorSubject<string>;
    translate: ReturnType<typeof vi.fn>;
  };

  const appointments: Appointment[] = [
    {
      id: 'appointment-1',
      patientId: 'patient-1',
      patientName: 'Juan Perez Galicia',
      appointmentDate:
        '2026-09-22T12:04:37',
      reason: 'Consulta de ejercicio',
      notes: null,
      status: 'Scheduled'
    },
    {
      id: 'appointment-2',
      patientId: 'patient-2',
      patientName: 'Pruebas Test',
      appointmentDate:
        '2026-09-23T12:04:37',
      reason: 'Consulta de valoración',
      notes: 'Primera valoración',
      status: 'InProgress'
    }
  ];

  const pagedResult:
    PagedResult<Appointment> = {
      items: appointments,
      pageNumber: 1,
      pageSize: 10,
      totalCount: 2,
      totalPages: 1
    };

  beforeEach(async () => {
    appointmentServiceMock = {
      getAll: vi.fn()
        .mockReturnValue(
          of(pagedResult)
        ),

      updateStatus: vi.fn()
    };

    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };

    translationServiceMock = {
      language$:
        new BehaviorSubject<string>('es'),

      translate: vi.fn(
        (key: string) => key
      )
    };

    await TestBed.configureTestingModule({
      imports: [
        AppointmentListComponent
      ],
      providers: [
        provideRouter([]),
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
    }).compileComponents();

    fixture = TestBed.createComponent(
      AppointmentListComponent
    );

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load appointments on init', () => {
    fixture.detectChanges();

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10
    );

    expect(
      component.appointments
    ).toEqual(
      appointments
    );

    expect(
      component.isLoading
    ).toBe(false);

    expect(
      component.errorMessage
    ).toBe('');
  });

  it('should update pagination metadata after loading appointments', () => {
    fixture.detectChanges();

    expect(
      component.pageNumber
    ).toBe(1);

    expect(
      component.pageSize
    ).toBe(10);

    expect(
      component.totalCount
    ).toBe(2);

    expect(
      component.totalPages
    ).toBe(1);
  });

  it('should display appointments in the table', () => {
    fixture.detectChanges();

    const element =
      fixture.nativeElement as HTMLElement;

    expect(
      element.textContent
    ).toContain(
      'Juan Perez Galicia'
    );

    expect(
      element.textContent
    ).toContain(
      'Consulta de ejercicio'
    );

    expect(
      element.textContent
    ).toContain(
      'Scheduled'
    );

    expect(
      element.textContent
    ).toContain(
      'Pruebas Test'
    );
  });

  it('should display the empty state when there are no appointments', () => {
    appointmentServiceMock.getAll
      .mockReturnValue(
        of({
          items: [],
          pageNumber: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0
        })
      );

    fixture.detectChanges();

    expect(
      component.appointments
    ).toEqual([]);

    const element =
      fixture.nativeElement as HTMLElement;

    expect(
      element.textContent
    ).toContain(
      'appointments.empty.title'
    );

    expect(
      element.textContent
    ).toContain(
      'appointments.empty.message'
    );
  });

  it('should set the error message when loading appointments fails', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    appointmentServiceMock.getAll
      .mockReturnValue(
        throwError(
          () => new Error('API error')
        )
      );

    fixture.detectChanges();

    expect(
      component.isLoading
    ).toBe(false);

    expect(
      component.errorMessage
    ).toBe(
      'appointments.loadError'
    );

    expect(
      component.appointments
    ).toEqual([]);

    expect(
      consoleErrorSpy
    ).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should translate keys using TranslationService', () => {
    translationServiceMock.translate
      .mockReturnValue(
        'Citas'
      );

    const result = component.t(
      'appointments.title'
    );

    expect(
      translationServiceMock.translate
    ).toHaveBeenCalledWith(
      'appointments.title'
    );

    expect(result).toBe(
      'Citas'
    );
  });

  it('should update appointment status successfully', () => {
    const updatedAppointment:
      Appointment = {
        ...appointments[0],
        status: 'InProgress'
      };

    appointmentServiceMock.updateStatus
      .mockReturnValue(
        of(updatedAppointment)
      );

    component.appointments = [
      ...appointments
    ];

    component.updateStatus(
      appointments[0],
      2
    );

    expect(
      appointmentServiceMock.updateStatus
    ).toHaveBeenCalledWith(
      'appointment-1',
      {
        status: 2
      }
    );

    expect(
      component.appointments[0].status
    ).toBe(
      'InProgress'
    );

    expect(
      component.appointments[1]
    ).toEqual(
      appointments[1]
    );

    expect(
      component.updatingAppointmentId
    ).toBeNull();

    expect(
      toastServiceMock.success
    ).toHaveBeenCalledWith(
      'appointments.status.success'
    );
  });

  it('should complete an in progress appointment', () => {
    const updatedAppointment:
      Appointment = {
        ...appointments[1],
        status: 'Completed'
      };

    appointmentServiceMock.updateStatus
      .mockReturnValue(
        of(updatedAppointment)
      );

    component.appointments = [
      ...appointments
    ];

    component.updateStatus(
      appointments[1],
      3
    );

    expect(
      appointmentServiceMock.updateStatus
    ).toHaveBeenCalledWith(
      'appointment-2',
      {
        status: 3
      }
    );

    expect(
      component.appointments[1].status
    ).toBe(
      'Completed'
    );
  });

  it('should prevent duplicate status updates while appointment is updating', () => {
    const updateSubject =
      new Subject<Appointment>();

    appointmentServiceMock.updateStatus
      .mockReturnValue(
        updateSubject.asObservable()
      );

    component.updateStatus(
      appointments[0],
      2
    );

    expect(
      component.updatingAppointmentId
    ).toBe(
      'appointment-1'
    );

    component.updateStatus(
      appointments[0],
      2
    );

    expect(
      appointmentServiceMock.updateStatus
    ).toHaveBeenCalledTimes(1);

    updateSubject.next({
      ...appointments[0],
      status: 'InProgress'
    });

    updateSubject.complete();
  });

  it('should identify the appointment being updated', () => {
    component.updatingAppointmentId =
      'appointment-1';

    expect(
      component.isUpdating(
        appointments[0]
      )
    ).toBe(true);

    expect(
      component.isUpdating(
        appointments[1]
      )
    ).toBe(false);
  });

  it('should show API error message when status update fails', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    appointmentServiceMock.updateStatus
      .mockReturnValue(
        throwError(() => ({
          error: {
            message:
              'Invalid status transition'
          }
        }))
      );

    component.updateStatus(
      appointments[0],
      2
    );

    expect(
      component.updatingAppointmentId
    ).toBeNull();

    expect(
      toastServiceMock.error
    ).toHaveBeenCalledWith(
      'Invalid status transition'
    );

    consoleErrorSpy.mockRestore();
  });

  it('should use translated fallback when status update error has no message', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    appointmentServiceMock.updateStatus
      .mockReturnValue(
        throwError(() => ({
          error: {}
        }))
      );

    component.updateStatus(
      appointments[0],
      2
    );

    expect(
      toastServiceMock.error
    ).toHaveBeenCalledWith(
      'appointments.status.error'
    );

    consoleErrorSpy.mockRestore();
  });

  it('should request appointment cancellation', () => {
    component.requestCancellation(
      appointments[0]
    );

    expect(
      component.appointmentToCancel
    ).toEqual(
      appointments[0]
    );
  });

  it('should close appointment cancellation', () => {
    component.appointmentToCancel =
      appointments[0];

    component.closeCancellation();

    expect(
      component.appointmentToCancel
    ).toBeNull();
  });

  it('should confirm appointment cancellation', () => {
    const cancelledAppointment:
      Appointment = {
        ...appointments[0],
        status: 'Cancelled'
      };

    appointmentServiceMock.updateStatus
      .mockReturnValue(
        of(cancelledAppointment)
      );

    component.appointments = [
      ...appointments
    ];

    component.appointmentToCancel =
      appointments[0];

    component.confirmCancellation();

    expect(
      appointmentServiceMock.updateStatus
    ).toHaveBeenCalledWith(
      'appointment-1',
      {
        status: 4
      }
    );

    expect(
      component.appointmentToCancel
    ).toBeNull();

    expect(
      component.appointments[0].status
    ).toBe(
      'Cancelled'
    );
  });

  it('should not confirm cancellation when there is no appointment selected', () => {
    component.appointmentToCancel =
      null;

    component.confirmCancellation();

    expect(
      appointmentServiceMock.updateStatus
    ).not.toHaveBeenCalled();
  });

  it('should not request cancellation while appointment is updating', () => {
    component.updatingAppointmentId =
      'appointment-1';

    component.requestCancellation(
      appointments[0]
    );

    expect(
      component.appointmentToCancel
    ).toBeNull();
  });

  it('should not close cancellation while appointment is updating', () => {
    component.appointmentToCancel =
      appointments[0];

    component.updatingAppointmentId =
      'appointment-1';

    component.closeCancellation();

    expect(
      component.appointmentToCancel
    ).toEqual(
      appointments[0]
    );
  });
});