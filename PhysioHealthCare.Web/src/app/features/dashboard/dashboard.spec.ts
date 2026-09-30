import { ComponentFixture, TestBed } from '@angular/core/testing';
import { registerLocaleData } from '@angular/common';
import localeEsMx from '@angular/common/locales/es-MX';

import { BehaviorSubject, of } from 'rxjs';

import { Dashboard } from './dashboard';

import { DashboardService } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast';
import { TranslationService } from '../../core/services/translation';

import { DashboardSummary } from '../../shared/models/dashboard-summary.model';

registerLocaleData(localeEsMx);

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  let dashboardServiceMock: {
    getSummary: ReturnType<typeof vi.fn>;
  };

  let toastServiceMock: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  let translationServiceMock: {
    language$: BehaviorSubject<string>;
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
    nextAppointment: {
      id: 'appointment-1',
      patientId: 'patient-1',
      patientName: 'Alexis Jonathan Hernandez Bautista',
      reason: 'Seguimiento a tratamiento',
      appointmentDate: '2026-09-30T02:01:00Z',
      status: 1,
    },
  };

  beforeEach(async () => {
    dashboardServiceMock = {
      getSummary: vi.fn().mockReturnValue(
        of(dashboardSummary)
      ),
    };

    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
    };

    translationServiceMock = {
      language$: new BehaviorSubject<string>('es'),

      translate: vi.fn(
        (key: string) => key
      ),

      getCurrentLanguage: vi
        .fn()
        .mockReturnValue('es'),
    };

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
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

  it('should load dashboard summary on init', () => {
    fixture.detectChanges();

    expect(
      dashboardServiceMock.getSummary
    ).toHaveBeenCalledTimes(1);

    expect(component.summary).toEqual(
      dashboardSummary
    );

    expect(component.isLoading).toBe(false);

    expect(component.errorMessage).toBe('');
  });
});