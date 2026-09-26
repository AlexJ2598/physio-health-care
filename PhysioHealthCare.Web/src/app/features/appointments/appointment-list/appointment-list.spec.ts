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
  PatientService
} from '../../../core/services/patient';

import {
  ToastService
} from '../../../core/services/toast';

import {
  TranslationService
} from '../../../core/services/translation';

import {
  Appointment,
  AppointmentFilters
} from '../../../shared/models/appointment';

import {
  Patient
} from '../../../shared/models/patient';

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

  let patientServiceMock: {
    getAll: ReturnType<typeof vi.fn>;
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
        '2026-09-22T12:04:37Z',
      reason: 'Consulta de ejercicio',
      notes: null,
      status: 'Scheduled'
    },
    {
      id: 'appointment-2',
      patientId: 'patient-2',
      patientName: 'Pruebas Test',
      appointmentDate:
        '2026-09-23T12:04:37Z',
      reason: 'Consulta de valoración',
      notes: 'Primera valoración',
      status: 'InProgress'
    }
  ];

  const patients: Patient[] = [
    {
      id: 'patient-1',
      fullName: 'Juan Perez Galicia',
      birthDate: '1998-01-01',
      gender: 'Male',
      phoneNumber: '1234567890',
      email: 'juan@test.com'
    },
    {
      id: 'patient-2',
      fullName: 'Pruebas Test',
      birthDate: '1995-05-10',
      gender: 'Female',
      phoneNumber: '0987654321',
      email: 'pruebas@test.com'
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

  const patientPagedResult:
    PagedResult<Patient> = {
      items: patients,
      pageNumber: 1,
      pageSize: 100,
      totalCount: 2,
      totalPages: 1
    };

  const defaultFilters:
    AppointmentFilters = {
      search: undefined,
      status: undefined,
      patientId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      sortBy: 'appointmentDate',
      sortDirection: 'asc'
    };

  beforeEach(async () => {
    appointmentServiceMock = {
      getAll: vi
        .fn()
        .mockReturnValue(
          of(pagedResult)
        ),

      updateStatus: vi.fn()
    };

    patientServiceMock = {
      getAll: vi
        .fn()
        .mockReturnValue(
          of(patientPagedResult)
        )
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
          provide: PatientService,
          useValue: patientServiceMock
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load patients and appointments on init', () => {
    fixture.detectChanges();

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
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      defaultFilters
    );

    expect(
      component.patients
    ).toEqual(
      patients
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
      component.isLoadingPatients
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

  it('should handle patient loading failure independently', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    patientServiceMock.getAll
      .mockReturnValue(
        throwError(
          () => new Error('Patients API error')
        )
      );

    fixture.detectChanges();

    expect(
      component.patients
    ).toEqual([]);

    expect(
      component.isLoadingPatients
    ).toBe(false);

    expect(
      component.appointments
    ).toEqual(appointments);

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

  it('should send search filter when searching explicitly', () => {
    fixture.detectChanges();

    appointmentServiceMock.getAll
      .mockClear();

    component.searchTerm =
      '  Juan  ';

    component.searchAppointments();

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      {
        ...defaultFilters,
        search: 'Juan'
      }
    );
  });

  it('should search automatically after debounce', () => {
    vi.useFakeTimers();

    fixture.detectChanges();

    appointmentServiceMock.getAll
      .mockClear();

    component.onSearchChange(
      'Juan'
    );

    expect(
      appointmentServiceMock.getAll
    ).not.toHaveBeenCalled();

    vi.advanceTimersByTime(399);

    expect(
      appointmentServiceMock.getAll
    ).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      {
        ...defaultFilters,
        search: 'Juan'
      }
    );
  });

  it('should restore all appointments when live search becomes empty', () => {
    vi.useFakeTimers();

    fixture.detectChanges();

    component.onSearchChange(
      'Juan'
    );

    vi.advanceTimersByTime(400);

    appointmentServiceMock.getAll
      .mockClear();

    component.onSearchChange('');

    vi.advanceTimersByTime(400);

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      defaultFilters
    );
  });

  it('should clear search and reload first page', () => {
    fixture.detectChanges();

    appointmentServiceMock.getAll
      .mockClear();

    component.searchTerm = 'Juan';
    component.pageNumber = 2;

    component.clearSearch();

    expect(
      component.searchTerm
    ).toBe('');

    expect(
      component.pageNumber
    ).toBe(1);

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      defaultFilters
    );
  });

  it('should not reload when clearing an already empty search', () => {
    fixture.detectChanges();

    appointmentServiceMock.getAll
      .mockClear();

    component.searchTerm = '';

    component.clearSearch();

    expect(
      appointmentServiceMock.getAll
    ).not.toHaveBeenCalled();
  });

  it('should filter appointments by patient', () => {
    fixture.detectChanges();

    appointmentServiceMock.getAll
      .mockClear();

    component.pageNumber = 2;

    component.filterByPatient(
      'patient-1'
    );

    expect(
      component.selectedPatientId
    ).toBe(
      'patient-1'
    );

    expect(
      component.pageNumber
    ).toBe(1);

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      {
        ...defaultFilters,
        patientId: 'patient-1'
      }
    );
  });

  it('should clear patient filter when empty patient id is selected', () => {
    fixture.detectChanges();

    component.selectedPatientId =
      'patient-1';

    appointmentServiceMock.getAll
      .mockClear();

    component.filterByPatient('');

    expect(
      component.selectedPatientId
    ).toBe('');

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      defaultFilters
    );
  });

  it('should filter appointments by status', () => {
    fixture.detectChanges();

    appointmentServiceMock.getAll
      .mockClear();

    component.pageNumber = 2;

    component.filterByStatus('2');

    expect(
      component.selectedStatus
    ).toBe(2);

    expect(
      component.pageNumber
    ).toBe(1);

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      {
        ...defaultFilters,
        status: 2
      }
    );
  });

  it('should clear status filter when all statuses are selected', () => {
    fixture.detectChanges();

    component.selectedStatus = 2;

    appointmentServiceMock.getAll
      .mockClear();

    component.filterByStatus('');

    expect(
      component.selectedStatus
    ).toBeNull();

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      defaultFilters
    );
  });

  it('should apply date range using UTC day boundaries', () => {
    fixture.detectChanges();

    appointmentServiceMock.getAll
      .mockClear();

    component.dateFrom =
      '2026-09-24';

    component.dateTo =
      '2026-09-25';

    component.pageNumber = 2;

    component.applyDateRange();

    const expectedDateFrom =
      new Date(
        2026,
        8,
        24,
        0,
        0,
        0,
        0
      ).toISOString();

    const expectedDateTo =
      new Date(
        2026,
        8,
        25,
        23,
        59,
        59,
        999
      ).toISOString();

    expect(
      component.pageNumber
    ).toBe(1);

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      {
        ...defaultFilters,
        dateFrom: expectedDateFrom,
        dateTo: expectedDateTo
      }
    );
  });

  it('should clear date range and reload first page', () => {
    fixture.detectChanges();

    component.dateFrom =
      '2026-09-24';

    component.dateTo =
      '2026-09-25';

    component.pageNumber = 2;

    appointmentServiceMock.getAll
      .mockClear();

    component.clearDateRange();

    expect(
      component.dateFrom
    ).toBe('');

    expect(
      component.dateTo
    ).toBe('');

    expect(
      component.pageNumber
    ).toBe(1);

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      defaultFilters
    );
  });

  it('should not reload when clearing an empty date range', () => {
    fixture.detectChanges();

    appointmentServiceMock.getAll
      .mockClear();

    component.dateFrom = '';
    component.dateTo = '';

    component.clearDateRange();

    expect(
      appointmentServiceMock.getAll
    ).not.toHaveBeenCalled();
  });

  it('should combine search, patient, status and date filters', () => {
    fixture.detectChanges();

    component.searchTerm =
      'valoracion';

    component.selectedPatientId =
      'patient-1';

    component.selectedStatus = 2;

    component.dateFrom =
      '2026-09-20';

    component.dateTo =
      '2026-09-25';

    appointmentServiceMock.getAll
      .mockClear();

    component.loadAppointments();

    const expectedDateFrom =
      new Date(
        2026,
        8,
        20,
        0,
        0,
        0,
        0
      ).toISOString();

    const expectedDateTo =
      new Date(
        2026,
        8,
        25,
        23,
        59,
        59,
        999
      ).toISOString();

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      {
        search: 'valoracion',
        status: 2,
        patientId: 'patient-1',
        dateFrom: expectedDateFrom,
        dateTo: expectedDateTo,
        sortBy: 'appointmentDate',
        sortDirection: 'asc'
      }
    );
  });

  it('should change sort field and reload first page', () => {
    fixture.detectChanges();

    appointmentServiceMock.getAll
      .mockClear();

    component.pageNumber = 2;

    component.changeSortField(
      'patientName'
    );

    expect(
      component.sortBy
    ).toBe(
      'patientName'
    );

    expect(
      component.pageNumber
    ).toBe(1);

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      {
        ...defaultFilters,
        sortBy: 'patientName'
      }
    );
  });

  it('should change sort direction to descending', () => {
    fixture.detectChanges();

    appointmentServiceMock.getAll
      .mockClear();

    component.pageNumber = 2;

    component.changeSortDirection(
      'desc'
    );

    expect(
      component.sortDirection
    ).toBe(
      'desc'
    );

    expect(
      component.pageNumber
    ).toBe(1);

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      {
        ...defaultFilters,
        sortDirection: 'desc'
      }
    );
  });

  it('should fall back to ascending for an invalid sort direction', () => {
    fixture.detectChanges();

    component.sortDirection =
      'desc';

    appointmentServiceMock.getAll
      .mockClear();

    component.changeSortDirection(
      'invalid'
    );

    expect(
      component.sortDirection
    ).toBe(
      'asc'
    );

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      defaultFilters
    );
  });

  it('should report whether previous and next pages exist', () => {
    component.pageNumber = 2;
    component.totalPages = 3;

    expect(
      component.hasPreviousPage
    ).toBe(true);

    expect(
      component.hasNextPage
    ).toBe(true);

    component.pageNumber = 1;

    expect(
      component.hasPreviousPage
    ).toBe(false);

    component.pageNumber = 3;

    expect(
      component.hasNextPage
    ).toBe(false);
  });

  it('should navigate to the next page', () => {
    fixture.detectChanges();

    component.pageNumber = 1;
    component.totalPages = 2;

    appointmentServiceMock.getAll
      .mockClear();

    appointmentServiceMock.getAll
      .mockReturnValue(
        of({
          items: appointments,
          pageNumber: 2,
          pageSize: 10,
          totalCount: 12,
          totalPages: 2
        })
      );

    component.goToNextPage();

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      2,
      10,
      defaultFilters
    );

    expect(
      component.pageNumber
    ).toBe(2);
  });

  it('should navigate to the previous page', () => {
    fixture.detectChanges();

    component.pageNumber = 2;
    component.totalPages = 2;

    appointmentServiceMock.getAll
      .mockClear();

    appointmentServiceMock.getAll
      .mockReturnValue(
        of({
          items: appointments,
          pageNumber: 1,
          pageSize: 10,
          totalCount: 12,
          totalPages: 2
        })
      );

    component.goToPreviousPage();

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      defaultFilters
    );

    expect(
      component.pageNumber
    ).toBe(1);
  });

  it('should not navigate before the first page', () => {
    fixture.detectChanges();

    component.pageNumber = 1;
    component.totalPages = 2;

    appointmentServiceMock.getAll
      .mockClear();

    component.goToPreviousPage();

    expect(
      appointmentServiceMock.getAll
    ).not.toHaveBeenCalled();

    expect(
      component.pageNumber
    ).toBe(1);
  });

  it('should not navigate after the last page', () => {
    fixture.detectChanges();

    component.pageNumber = 2;
    component.totalPages = 2;

    appointmentServiceMock.getAll
      .mockClear();

    component.goToNextPage();

    expect(
      appointmentServiceMock.getAll
    ).not.toHaveBeenCalled();

    expect(
      component.pageNumber
    ).toBe(2);
  });

  it('should not change page while appointments are loading', () => {
    fixture.detectChanges();

    component.pageNumber = 1;
    component.totalPages = 2;
    component.isLoading = true;

    appointmentServiceMock.getAll
      .mockClear();

    component.goToNextPage();

    expect(
      appointmentServiceMock.getAll
    ).not.toHaveBeenCalled();

    expect(
      component.pageNumber
    ).toBe(1);
  });

  it('should change page size and return to first page', () => {
    fixture.detectChanges();

    component.pageNumber = 2;

    appointmentServiceMock.getAll
      .mockClear();

    appointmentServiceMock.getAll
      .mockReturnValue(
        of({
          items: appointments,
          pageNumber: 1,
          pageSize: 20,
          totalCount: 12,
          totalPages: 1
        })
      );

    component.changePageSize(
      '20'
    );

    expect(
      appointmentServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      20,
      defaultFilters
    );

    expect(
      component.pageNumber
    ).toBe(1);

    expect(
      component.pageSize
    ).toBe(20);
  });

  it('should ignore invalid page sizes', () => {
    fixture.detectChanges();

    appointmentServiceMock.getAll
      .mockClear();

    component.changePageSize(
      'invalid'
    );

    expect(
      component.pageSize
    ).toBe(10);

    expect(
      appointmentServiceMock.getAll
    ).not.toHaveBeenCalled();

    component.changePageSize(
      '0'
    );

    expect(
      appointmentServiceMock.getAll
    ).not.toHaveBeenCalled();
  });

  it('should not reload when selecting the current page size', () => {
    fixture.detectChanges();

    appointmentServiceMock.getAll
      .mockClear();

    component.changePageSize(
      '10'
    );

    expect(
      appointmentServiceMock.getAll
    ).not.toHaveBeenCalled();
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