import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

import { AppointmentListComponent } from './appointment-list';
import { AppointmentService } from '../../../core/services/appointment';
import { TranslationService } from '../../../core/services/translation';
import { Appointment } from '../../../shared/models/appointment';
import { PagedResult } from '../../../shared/models/paged-result';

describe('AppointmentListComponent', () => {
  let component: AppointmentListComponent;
  let fixture: ComponentFixture<AppointmentListComponent>;

  let appointmentServiceMock: {
    getAll: ReturnType<typeof vi.fn>;
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
      appointmentDate: '2026-09-22T12:04:37',
      reason: 'Consulta de ejercicio',
      notes: null,
      status: 'Scheduled'
    },
    {
      id: 'appointment-2',
      patientId: 'patient-2',
      patientName: 'Pruebas Test',
      appointmentDate: '2026-09-23T12:04:37',
      reason: 'Consulta de valoración',
      notes: 'Primera valoración',
      status: 'InProgress'
    }
  ];

  const pagedResult: PagedResult<Appointment> = {
    items: appointments,
    pageNumber: 1,
    pageSize: 10,
    totalCount: 2,
    totalPages: 1
  };

  beforeEach(async () => {
    appointmentServiceMock = {
      getAll: vi.fn().mockReturnValue(of(pagedResult))
    };

    translationServiceMock = {
      language$: new BehaviorSubject<string>('es'),
      translate: vi.fn((key: string) => key)
    };

    await TestBed.configureTestingModule({
      imports: [AppointmentListComponent],
      providers: [
        provideRouter([]),
        {
          provide: AppointmentService,
          useValue: appointmentServiceMock
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
    ).toHaveBeenCalledWith(1, 10);

    expect(component.appointments).toEqual(
      appointments
    );

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  it('should update pagination metadata after loading appointments', () => {
    fixture.detectChanges();

    expect(component.pageNumber).toBe(1);
    expect(component.pageSize).toBe(10);
    expect(component.totalCount).toBe(2);
    expect(component.totalPages).toBe(1);
  });

  it('should display appointments in the table', () => {
    fixture.detectChanges();

    const element =
      fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain(
      'Juan Perez Galicia'
    );

    expect(element.textContent).toContain(
      'Consulta de ejercicio'
    );

    expect(element.textContent).toContain(
      'Scheduled'
    );

    expect(element.textContent).toContain(
      'Pruebas Test'
    );
  });

  it('should display the empty state when there are no appointments', () => {
    appointmentServiceMock.getAll.mockReturnValue(
      of({
        items: [],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0
      })
    );

    fixture.detectChanges();

    expect(component.appointments).toEqual([]);

    const element =
      fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain(
      'appointments.empty.title'
    );

    expect(element.textContent).toContain(
      'appointments.empty.message'
    );
  });

  it('should set the error message when loading appointments fails', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    appointmentServiceMock.getAll.mockReturnValue(
      throwError(() => new Error('API error'))
    );

    fixture.detectChanges();

    expect(component.isLoading).toBe(false);

    expect(component.errorMessage).toBe(
      'appointments.loadError'
    );

    expect(component.appointments).toEqual([]);

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('should translate keys using TranslationService', () => {
    translationServiceMock.translate.mockReturnValue(
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

    expect(result).toBe('Citas');
  });
});