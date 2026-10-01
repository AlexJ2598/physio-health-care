import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { DashboardService } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast';
import { TranslationService } from '../../core/services/translation';
import { DashboardSummary } from '../../shared/models/dashboard-summary.model';
import { Dashboard } from './dashboard';

registerLocaleData(localeEsMx);

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let dashboardServiceMock: {
    getSummary: ReturnType<typeof vi.fn>;
  };

  let toastServiceMock: {
    error: ReturnType<typeof vi.fn>;
  };

  let translationServiceMock: {
    translate: ReturnType<typeof vi.fn>;
    getCurrentLanguage: ReturnType<typeof vi.fn>;
  };

  const dashboardSummary: DashboardSummary = {
    todayAppointments: 2,
    todayScheduled: 1,
    todayInProgress: 0,
    todayCompleted: 1,
    historicalCompleted: 4,
    historicalCancelled: 5,
    currentAppointment: null,
    nextAppointment: {
      id: 'appointment-1',
      patientId: 'patient-1',
      patientName: 'Alexis Jonathan Hernandez Bautista',
      reason: 'Seguimiento a tratamiento',
      appointmentDate: '2026-09-30T02:01:00Z',
      status: 1,
    },
  };

  const dashboardSummaryWithoutNextAppointment: DashboardSummary = {
    todayAppointments: 1,
    todayScheduled: 0,
    todayInProgress: 0,
    todayCompleted: 1,
    historicalCompleted: 4,
    historicalCancelled: 5,
    currentAppointment: null,
    nextAppointment: null,
  };

  beforeEach(async () => {
    dashboardServiceMock = {
      getSummary: vi.fn().mockReturnValue(of(dashboardSummary)),
    };
    toastServiceMock = {
      error: vi.fn(),
    };
    translationServiceMock = {
      translate: vi.fn((key: string) => key),
      getCurrentLanguage: vi.fn().mockReturnValue('es'),
    };
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        {
          provide: DashboardService,
          useValue: dashboardServiceMock,
        },
        {
          provide: ToastService,
          useValue: toastServiceMock,
        },
        {
          provide: TranslationService,
          useValue: translationServiceMock,
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the expected initial state before initialization', () => {
    expect(component.summary).toBeNull();
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  it('should load dashboard summary on init', () => {
    fixture.detectChanges();

    expect(dashboardServiceMock.getSummary).toHaveBeenCalledTimes(1);
    expect(component.summary).toEqual(dashboardSummary);
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  it('should store all dashboard metrics returned by the service', () => {
    fixture.detectChanges();

    expect(component.summary).not.toBeNull();
    expect(component.summary?.todayAppointments).toBe(2);
    expect(component.summary?.todayScheduled).toBe(1);
    expect(component.summary?.todayInProgress).toBe(0);
    expect(component.summary?.todayCompleted).toBe(1);
    expect(component.summary?.historicalCompleted).toBe(4);
    expect(component.summary?.historicalCancelled).toBe(5);
  });

  it('should store the next appointment returned by the service', () => {
    fixture.detectChanges();
    const nextAppointment = component.summary?.nextAppointment;

    expect(nextAppointment).not.toBeNull();
    expect(nextAppointment?.id).toBe('appointment-1');
    expect(nextAppointment?.patientId).toBe('patient-1');
    expect(nextAppointment?.patientName).toBe('Alexis Jonathan Hernandez Bautista');
    expect(nextAppointment?.reason).toBe('Seguimiento a tratamiento');
    expect(nextAppointment?.appointmentDate).toBe('2026-09-30T02:01:00Z');
    expect(nextAppointment?.status).toBe(1);
  });

  it('should support a dashboard summary without a next appointment', () => {
    dashboardServiceMock.getSummary.mockReturnValue(of(dashboardSummaryWithoutNextAppointment));
    fixture.detectChanges();

    expect(component.summary).toEqual(dashboardSummaryWithoutNextAppointment);
    expect(component.summary?.nextAppointment).toBeNull();
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  it('should set loading state while dashboard request is pending', () => {
    const summarySubject = new Subject<DashboardSummary>();
    dashboardServiceMock.getSummary.mockReturnValue(summarySubject.asObservable());

    component.loadDashboard();

    expect(component.isLoading).toBe(true);
    expect(component.summary).toBeNull();
    summarySubject.next(dashboardSummary);
    summarySubject.complete();
    expect(component.summary).toEqual(dashboardSummary);
    expect(component.isLoading).toBe(false);
  });

  it('should prevent duplicate dashboard requests while loading', () => {
    const summarySubject = new Subject<DashboardSummary>();
    dashboardServiceMock.getSummary.mockReturnValue(summarySubject.asObservable());

    component.loadDashboard();

    expect(component.isLoading).toBe(true);

    component.loadDashboard();

    expect(dashboardServiceMock.getSummary).toHaveBeenCalledTimes(1);
    summarySubject.next(dashboardSummary);
    summarySubject.complete();
    expect(component.isLoading).toBe(false);
  });

  it('should clear previous error before loading dashboard again', () => {
    component.errorMessage = 'dashboard.loadError';

    component.loadDashboard();

    expect(component.errorMessage).toBe('');
    expect(component.summary).toEqual(dashboardSummary);
  });

  it('should clear loading state after successful request', () => {
    component.loadDashboard();

    expect(component.isLoading).toBe(false);
    expect(component.summary).toEqual(dashboardSummary);
  });

  it('should handle dashboard loading failure', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    dashboardServiceMock.getSummary.mockReturnValue(
      throwError(() => new Error('Dashboard API error')),
    );

    component.loadDashboard();

    expect(component.summary).toBeNull();
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('dashboard.loadError');
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should show translated toast when dashboard loading fails', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    dashboardServiceMock.getSummary.mockReturnValue(
      throwError(() => new Error('Dashboard API error')),
    );

    component.loadDashboard();

    expect(translationServiceMock.translate).toHaveBeenCalledWith('dashboard.loadError');
    expect(toastServiceMock.error).toHaveBeenCalledWith('dashboard.loadError');
    expect(toastServiceMock.error).toHaveBeenCalledTimes(1);
    consoleErrorSpy.mockRestore();
  });

  it('should use the translated dashboard error message', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    translationServiceMock.translate.mockImplementation((key: string) => {
      if (key === 'dashboard.loadError') {
        return 'No se pudo cargar el resumen.';
      }
      return key;
    });
    dashboardServiceMock.getSummary.mockReturnValue(
      throwError(() => new Error('Dashboard API error')),
    );

    component.loadDashboard();

    expect(component.errorMessage).toBe('No se pudo cargar el resumen.');
    expect(toastServiceMock.error).toHaveBeenCalledWith('No se pudo cargar el resumen.');
    consoleErrorSpy.mockRestore();
  });

  it('should clear previous summary when dashboard loading fails', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    component.summary = dashboardSummary;
    dashboardServiceMock.getSummary.mockReturnValue(
      throwError(() => new Error('Dashboard API error')),
    );

    component.loadDashboard();

    expect(component.summary).toBeNull();
    consoleErrorSpy.mockRestore();
  });

  it('should load dashboard successfully after a previous failure', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    dashboardServiceMock.getSummary.mockReturnValueOnce(
      throwError(() => new Error('Dashboard API error')),
    );

    component.loadDashboard();

    expect(component.summary).toBeNull();
    expect(component.errorMessage).toBe('dashboard.loadError');
    dashboardServiceMock.getSummary.mockReturnValueOnce(of(dashboardSummary));

    component.loadDashboard();

    expect(dashboardServiceMock.getSummary).toHaveBeenCalledTimes(2);
    expect(component.summary).toEqual(dashboardSummary);
    expect(component.errorMessage).toBe('');
    expect(component.isLoading).toBe(false);
    consoleErrorSpy.mockRestore();
  });

  it('should translate keys using TranslationService', () => {
    translationServiceMock.translate.mockReturnValue('Inicio');
    const result = component.t('dashboard.title');

    expect(translationServiceMock.translate).toHaveBeenCalledWith('dashboard.title');
    expect(result).toBe('Inicio');
  });

  it('should return es-MX locale when current language is Spanish', () => {
    translationServiceMock.getCurrentLanguage.mockReturnValue('es');
    const result = component.dateLocale();

    expect(translationServiceMock.getCurrentLanguage).toHaveBeenCalled();
    expect(result).toBe('es-MX');
  });

  it('should return en-US locale when current language is English', () => {
    translationServiceMock.getCurrentLanguage.mockReturnValue('en');
    const result = component.dateLocale();

    expect(result).toBe('en-US');
  });

  it('should return en-US locale for a language other than Spanish', () => {
    translationServiceMock.getCurrentLanguage.mockReturnValue('fr');
    const result = component.dateLocale();

    expect(result).toBe('en-US');
  });

  it('should unsubscribe from dashboard request on destroy', () => {
    const summarySubject = new Subject<DashboardSummary>();
    dashboardServiceMock.getSummary.mockReturnValue(summarySubject.asObservable());

    component.loadDashboard();

    expect(component.isLoading).toBe(true);
    component.ngOnDestroy();
    summarySubject.next(dashboardSummary);
    summarySubject.complete();
    expect(component.summary).toBeNull();
  });

  it('should render metric values with the expected appointment filters', () => {
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('.dashboard-card-link'));

    expect(links.map((link) => link.querySelector('.card-value')?.textContent?.trim())).toEqual([
      '2',
      '1',
      '0',
      '1',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/appointments?today=true',
      '/appointments?today=true&status=1',
      '/appointments?today=true&status=2',
      '/appointments?today=true&status=3',
    ]);
    expect(
      Array.from(element.querySelectorAll('.history-grid .card-value'), (value) =>
        value.textContent?.trim(),
      ),
    ).toEqual(['4', '5']);
  });

  it('should render the empty state when there is no next appointment', () => {
    dashboardServiceMock.getSummary.mockReturnValue(of(dashboardSummaryWithoutNextAppointment));

    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.next-appointment-card')).toBeNull();
    expect(element.textContent).toContain('dashboard.nextAppointment.emptyTitle');
  });
});
