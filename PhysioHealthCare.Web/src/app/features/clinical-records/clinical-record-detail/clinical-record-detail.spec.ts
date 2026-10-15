import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ClinicalRecordService } from '../../../core/services/clinical-record.service';
import { TranslationService } from '../../../core/services/translation';
import { ClinicalRecord } from '../../../shared/models/clinical-record.model';
import { ClinicalRecordDetail } from './clinical-record-detail';

describe('ClinicalRecordDetail', () => {
  let language: BehaviorSubject<string>;
  let api: { getByPatientId: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    registerLocaleData(localeEs);
    language = new BehaviorSubject('es');
    api = {
      getByPatientId: vi
        .fn()
        .mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 }))),
      create: vi
        .fn()
        .mockReturnValue(
          of({ recordNumber: 'CR-001', createdAt: '2026-01-01', hasClinicalHistory: false }),
        ),
    };
    router = { navigate: vi.fn().mockResolvedValue(true) };
    await TestBed.configureTestingModule({
      imports: [ClinicalRecordDetail],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'patient-1' }) } },
        },
        { provide: Router, useValue: router },
        { provide: ClinicalRecordService, useValue: api },
        {
          provide: TranslationService,
          useValue: {
            language$: language,
            getCurrentLanguage: () => language.value,
            translate: (key: string) => language.value + ':' + key,
          },
        },
      ],
    }).compileComponents();
  });

  it('renders the empty state and creates a record with a translated alert', async () => {
    const fixture = TestBed.createComponent(ClinicalRecordDetail);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    expect(api.getByPatientId).toHaveBeenCalledWith('patient-1');
    page.querySelector<HTMLButtonElement>('.btn-primary')!.click();
    await fixture.whenStable();
    expect(page.querySelector('[role="status"]')?.textContent).toContain(
      'es:clinicalRecords.createSuccess',
    );
    expect(page.querySelector('.record-summary')?.textContent).toContain('CR-001');
    language.next('en');
    await fixture.whenStable();
    expect(page.querySelector('[role="status"]')?.textContent).toContain(
      'en:clinicalRecords.createSuccess',
    );
  });

  it.each([
    [401, 'clinicalRecords.accessDenied'],
    [403, 'clinicalRecords.accessDenied'],
    [0, 'clinicalRecords.connectionError'],
    [500, 'clinicalRecords.loadError'],
  ])('renders translated error %s and retries', async (status, message) => {
    api.getByPatientId.mockReturnValue(throwError(() => new HttpErrorResponse({ status })));

    const fixture = TestBed.createComponent(ClinicalRecordDetail);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('[role="alert"]')?.textContent).toContain('es:' + message);
    page.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    expect(api.getByPatientId).toHaveBeenCalledTimes(2);
  });

  it('navigates back to patients', async () => {
    const fixture = TestBed.createComponent(ClinicalRecordDetail);
    await fixture.whenStable();
    fixture.nativeElement.querySelector('.page-header button').click();
    expect(router.navigate).toHaveBeenCalledWith(['/patients']);
  });
});

describe('ClinicalRecordDetail data and actions', () => {
  const record: ClinicalRecord = {
    id: 'record-1',
    patientId: 'patient-1',
    recordNumber: 'CR-001',
    createdAt: '2026-01-01T00:00:00Z',
    hasClinicalHistory: false,
  };
  let component: ClinicalRecordDetail;
  let api: { getByPatientId: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  const failure = (status: number) => throwError(() => new HttpErrorResponse({ status }));

  beforeEach(() => {
    api = {
      getByPatientId: vi.fn().mockReturnValue(of(record)),
      create: vi.fn().mockReturnValue(of(record)),
    };
    TestBed.configureTestingModule({
      imports: [ClinicalRecordDetail],
      providers: [
        { provide: ClinicalRecordService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: record.patientId }) } },
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: TranslationService,
          useValue: {
            language$: of('es'),
            translate: (key: string) => key,
            getCurrentLanguage: () => 'es',
          },
        },
      ],
    });
    component = TestBed.createComponent(ClinicalRecordDetail).componentInstance;
  });

  it('navigates to the patient clinical history', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.ngOnInit();
    component.goToClinicalHistory();

    expect(navigateSpy).toHaveBeenCalledExactlyOnceWith([
      '/patients',
      'patient-1',
      'clinical-record',
      'history',
    ]);
  });

  it('does not navigate to clinical history when the patient ID is empty', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    vi.spyOn(TestBed.inject(ActivatedRoute).snapshot.paramMap, 'get').mockReturnValue(null);

    component.ngOnInit();
    component.goToClinicalHistory();

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('rejects a missing patient without requesting data', () => {
    vi.spyOn(TestBed.inject(ActivatedRoute).snapshot.paramMap, 'get').mockReturnValue(null);
    component.ngOnInit();
    component.loadClinicalRecord();
    component.createClinicalRecord();
    expect(component.errorMessage).toBe('clinicalRecords.invalidPatient');
    expect(api.getByPatientId).not.toHaveBeenCalled();
    expect(api.create).not.toHaveBeenCalled();
  });

  it('loads the patient record', () => {
    component.ngOnInit();
    expect(api.getByPatientId).toHaveBeenCalledWith(record.patientId);
    expect(component.clinicalRecord).toEqual(record);
    expect(component.isLoading).toBe(false);
  });

  it('treats a missing record as an empty state', () => {
    api.getByPatientId.mockReturnValue(failure(404));
    component.ngOnInit();
    expect(component.clinicalRecord).toBeNull();
    expect(component.errorMessage).toBe('');
    expect(component.isLoading).toBe(false);
  });

  it('allows retrying a failed load', () => {
    api.getByPatientId.mockReturnValueOnce(failure(500));
    component.ngOnInit();
    expect(component.errorMessage).toBe('clinicalRecords.loadError');
    component.loadClinicalRecord();
    expect(component.errorMessage).toBe('');
    expect(component.clinicalRecord).toEqual(record);
  });

  it('blocks overlapping requests while loading', () => {
    const pending = new Subject<ClinicalRecord>();
    api.getByPatientId.mockReturnValue(pending);
    component.ngOnInit();
    component.loadClinicalRecord();
    component.createClinicalRecord();
    expect(component.isBusy).toBe(true);
    expect(api.getByPatientId).toHaveBeenCalledTimes(1);
    expect(api.create).not.toHaveBeenCalled();
    pending.next(record);
    pending.complete();
    expect(component.isBusy).toBe(false);
  });

  it('creates a record and clears stale success when reloading', () => {
    api.getByPatientId.mockReturnValueOnce(failure(404));
    component.ngOnInit();
    component.createClinicalRecord();
    expect(api.create).toHaveBeenCalledWith(record.patientId);
    expect(component.clinicalRecord).toEqual(record);
    expect(component.successMessage).toBe('clinicalRecords.createSuccess');
    expect(component.isCreating).toBe(false);
    component.loadClinicalRecord();
    expect(component.successMessage).toBe('');
  });

  it.each([
    [400, 'clinicalRecords.createError'],
    [409, 'clinicalRecords.duplicateError'],
    [401, 'clinicalRecords.accessDenied'],
    [403, 'clinicalRecords.accessDenied'],
    [0, 'clinicalRecords.connectionError'],
    [500, 'clinicalRecords.createError'],
  ])('handles creation error %s', (status, message) => {
    api.getByPatientId.mockReturnValue(failure(404));
    api.create.mockReturnValue(failure(status));
    component.ngOnInit();
    component.createClinicalRecord();
    expect(component.errorMessage).toBe(message);
    expect(component.isCreating).toBe(false);
  });

  it('blocks repeated creation and cancels pending requests on destruction', () => {
    const pending = new Subject<ClinicalRecord>();
    api.getByPatientId.mockReturnValue(failure(404));
    api.create.mockReturnValue(pending);
    component.ngOnInit();
    component.createClinicalRecord();
    component.createClinicalRecord();
    component.loadClinicalRecord();
    expect(component.isCreating).toBe(true);
    expect(api.create).toHaveBeenCalledTimes(1);
    expect(api.getByPatientId).toHaveBeenCalledTimes(1);
    TestBed.resetTestingModule();
    pending.next(record);
    expect(component.clinicalRecord).toBeNull();
    expect(component.isCreating).toBe(false);
  });
});

describe('ClinicalRecordDetail.loadClinicalRecord', () => {
  const record: ClinicalRecord = {
    id: 'record-1',
    patientId: 'patient-1',
    recordNumber: 'CR-001',
    createdAt: '2026-01-01T00:00:00Z',
    hasClinicalHistory: false,
  };
  let component: ClinicalRecordDetail;
  let getByPatientId: ReturnType<typeof vi.fn>;
  let markForCheck: ReturnType<typeof vi.fn>;
  let pending: Subject<ClinicalRecord>;

  // Test setup

  beforeEach(() => {
    pending = new Subject<ClinicalRecord>();
    getByPatientId = vi.fn().mockReturnValue(pending);
    markForCheck = vi.fn();
    component = new ClinicalRecordDetail(
      { getByPatientId } as unknown as ClinicalRecordService,
      {} as TranslationService,
      { markForCheck } as unknown as ChangeDetectorRef,
      {} as ActivatedRoute,
      {} as Router,
    );
    component.patientId = record.patientId;
    component.errorMessage = 'previousError';
    component.successMessage = 'previousSuccess';
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  // Guards

  it.each([
    { patientId: '', isLoading: false, isCreating: false },
    { patientId: record.patientId, isLoading: true, isCreating: false },
    { patientId: record.patientId, isLoading: false, isCreating: true },
    { patientId: record.patientId, isLoading: true, isCreating: true },
  ])('preserves state and skips requests when blocked: %j', (state) => {
    Object.assign(component, state);
    component.clinicalRecord = record;

    component.loadClinicalRecord();

    expect(getByPatientId).not.toHaveBeenCalled();
    expect(component.clinicalRecord).toEqual(record);
    expect(component.isLoading).toBe(state.isLoading);
    expect(component.isCreating).toBe(state.isCreating);
    expect(component.errorMessage).toBe('previousError');
    expect(component.successMessage).toBe('previousSuccess');
    expect(markForCheck).not.toHaveBeenCalled();
  });

  // Loading and success

  it('starts loading, clears both messages and notifies the view before the request', () => {
    getByPatientId.mockImplementation(() => {
      expect(component.isLoading).toBe(true);
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');
      expect(markForCheck).toHaveBeenCalled();
      return pending;
    });

    component.loadClinicalRecord();

    expect(getByPatientId).toHaveBeenCalledExactlyOnceWith(record.patientId);
    expect(component.isBusy).toBe(true);
    expect(component.isCreating).toBe(false);
  });

  it('replaces the previous record and keeps loading until the request completes', () => {
    component.clinicalRecord = { ...record, id: 'old-record' };
    component.loadClinicalRecord();
    markForCheck.mockClear();

    pending.next(record);

    expect(component.clinicalRecord).toEqual(record);
    expect(component.isLoading).toBe(true);
    expect(component.errorMessage).toBe('');
    expect(markForCheck).toHaveBeenCalled();
    markForCheck.mockClear();

    pending.complete();

    expect(component.isLoading).toBe(false);
    expect(component.isBusy).toBe(false);
    expect(markForCheck).toHaveBeenCalled();
  });

  it('finishes loading even if the request completes without emitting a record', () => {
    component.loadClinicalRecord();
    markForCheck.mockClear();

    pending.complete();

    expect(component.clinicalRecord).toBeNull();
    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('');
    expect(markForCheck).toHaveBeenCalled();
  });

  // HTTP errors

  it.each([
    [404, ''],
    [401, 'clinicalRecords.accessDenied'],
    [403, 'clinicalRecords.accessDenied'],
    [0, 'clinicalRecords.connectionError'],
    [400, 'clinicalRecords.loadError'],
    [409, 'clinicalRecords.loadError'],
    [422, 'clinicalRecords.loadError'],
    [500, 'clinicalRecords.loadError'],
    [503, 'clinicalRecords.loadError'],
  ])('handles HTTP %s, removes stale data and finishes loading', (status, message) => {
    component.clinicalRecord = record;
    component.loadClinicalRecord();
    markForCheck.mockClear();

    pending.error(new HttpErrorResponse({ status }));

    expect(component.clinicalRecord).toBeNull();
    expect(component.errorMessage).toBe(message);
    expect(component.successMessage).toBe('');
    expect(component.isLoading).toBe(false);
    expect(component.isBusy).toBe(false);
    expect(markForCheck).toHaveBeenCalled();
  });

  it.each([0, 401, 403, 404, 500])('can successfully retry after HTTP %s', (status) => {
    component.loadClinicalRecord();
    pending.error(new HttpErrorResponse({ status }));
    getByPatientId.mockReturnValue(of(record));

    component.loadClinicalRecord();

    expect(getByPatientId).toHaveBeenCalledTimes(2);
    expect(component.clinicalRecord).toEqual(record);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
    expect(component.isLoading).toBe(false);
  });

  // Subscription cleanup

  it('cancels loading on destruction and ignores later emissions and errors', () => {
    component.loadClinicalRecord();
    markForCheck.mockClear();

    component.ngOnDestroy();

    expect(component.isLoading).toBe(false);
    expect(markForCheck).toHaveBeenCalled();
    markForCheck.mockClear();
    pending.next(record);
    pending.error(new HttpErrorResponse({ status: 403 }));

    expect(component.clinicalRecord).toBeNull();
    expect(component.errorMessage).toBe('');
    expect(markForCheck).not.toHaveBeenCalled();
  });
});

describe('ClinicalRecordDetail.createClinicalRecord', () => {
  const record: ClinicalRecord = {
    id: 'record-1',
    patientId: 'patient-1',
    recordNumber: 'CR-001',
    createdAt: '2026-01-01T00:00:00Z',
    hasClinicalHistory: false,
  };
  let component: ClinicalRecordDetail;
  let create: ReturnType<typeof vi.fn>;
  let getByPatientId: ReturnType<typeof vi.fn>;
  let markForCheck: ReturnType<typeof vi.fn>;
  let pendingCreation: Subject<ClinicalRecord>;
  let pendingRecovery: Subject<ClinicalRecord>;

  // Test setup

  beforeEach(() => {
    pendingCreation = new Subject<ClinicalRecord>();
    pendingRecovery = new Subject<ClinicalRecord>();
    create = vi.fn().mockReturnValue(pendingCreation);
    getByPatientId = vi.fn().mockReturnValue(pendingRecovery);
    markForCheck = vi.fn();
    component = new ClinicalRecordDetail(
      { create, getByPatientId } as unknown as ClinicalRecordService,
      {} as TranslationService,
      { markForCheck } as unknown as ChangeDetectorRef,
      {} as ActivatedRoute,
      {} as Router,
    );
    component.patientId = record.patientId;
    component.errorMessage = 'previousError';
    component.successMessage = 'previousSuccess';
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  // Guards and creation

  it.each([
    { patientId: '', isLoading: false, isCreating: false },
    { patientId: record.patientId, isLoading: true, isCreating: false },
    { patientId: record.patientId, isLoading: false, isCreating: true },
    { patientId: record.patientId, isLoading: true, isCreating: true },
  ])('preserves state and skips creation when blocked: %j', (state) => {
    Object.assign(component, state);
    component.clinicalRecord = record;

    component.createClinicalRecord();

    expect(create).not.toHaveBeenCalled();
    expect(getByPatientId).not.toHaveBeenCalled();
    expect(component.clinicalRecord).toEqual(record);
    expect(component.isCreating).toBe(state.isCreating);
    expect(component.isLoading).toBe(state.isLoading);
    expect(component.errorMessage).toBe('previousError');
    expect(component.successMessage).toBe('previousSuccess');
    expect(markForCheck).not.toHaveBeenCalled();
  });

  it('clears messages and stays busy until the POST completes', () => {
    component.createClinicalRecord();

    expect(create).toHaveBeenCalledExactlyOnceWith(record.patientId);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
    expect(component.isCreating).toBe(true);
    expect(component.isBusy).toBe(true);
    expect(markForCheck).toHaveBeenCalled();
    markForCheck.mockClear();

    pendingCreation.next(record);

    expect(component.clinicalRecord).toEqual(record);
    expect(component.successMessage).toBe('clinicalRecords.createSuccess');
    expect(component.isCreating).toBe(true);
    expect(markForCheck).toHaveBeenCalled();
    markForCheck.mockClear();
    pendingCreation.complete();

    expect(component.isCreating).toBe(false);
    expect(component.isBusy).toBe(false);
    expect(getByPatientId).not.toHaveBeenCalled();
    expect(markForCheck).toHaveBeenCalled();
  });

  // Conflict recovery

  it('keeps creation locked throughout conflict recovery and recovers without success or error alerts', () => {
    component.createClinicalRecord();
    pendingCreation.error(new HttpErrorResponse({ status: 409 }));

    expect(getByPatientId).toHaveBeenCalledExactlyOnceWith(record.patientId);
    expect(component.isCreating).toBe(true);
    expect(component.isLoading).toBe(false);
    expect(component.isBusy).toBe(true);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');

    component.createClinicalRecord();
    component.loadClinicalRecord();

    expect(create).toHaveBeenCalledTimes(1);
    expect(getByPatientId).toHaveBeenCalledTimes(1);
    markForCheck.mockClear();
    pendingRecovery.next(record);

    expect(component.clinicalRecord).toEqual(record);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
    expect(component.isCreating).toBe(true);
    expect(markForCheck).toHaveBeenCalled();
    markForCheck.mockClear();
    pendingRecovery.complete();

    expect(component.isCreating).toBe(false);
    expect(component.isBusy).toBe(false);
    expect(markForCheck).toHaveBeenCalled();
  });

  it('handles a synchronous recovery without showing creation success', () => {
    create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    getByPatientId.mockReturnValue(of(record));

    component.createClinicalRecord();

    expect(component.clinicalRecord).toEqual(record);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
    expect(component.isCreating).toBe(false);
  });

  it.each([0, 400, 401, 403, 404, 409, 500])(
    'preserves the original duplicate error when recovery fails with HTTP %s',
    (status) => {
      component.createClinicalRecord();
      pendingCreation.error(new HttpErrorResponse({ status: 409 }));
      markForCheck.mockClear();

      pendingRecovery.error(new HttpErrorResponse({ status }));

      expect(component.clinicalRecord).toBeNull();
      expect(component.errorMessage).toBe('clinicalRecords.duplicateError');
      expect(component.successMessage).toBe('');
      expect(component.isCreating).toBe(false);
      expect(component.isBusy).toBe(false);
      expect(getByPatientId).toHaveBeenCalledTimes(1);
      expect(markForCheck).toHaveBeenCalled();
    },
  );

  it('allows retrying after recovery fails and clears the duplicate error', () => {
    component.createClinicalRecord();
    pendingCreation.error(new HttpErrorResponse({ status: 409 }));
    pendingRecovery.error(new HttpErrorResponse({ status: 500 }));
    create.mockReturnValue(of(record));

    component.createClinicalRecord();

    expect(create).toHaveBeenCalledTimes(2);
    expect(getByPatientId).toHaveBeenCalledTimes(1);
    expect(component.clinicalRecord).toEqual(record);
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('clinicalRecords.createSuccess');
    expect(component.isCreating).toBe(false);
  });

  it('resets the recovery flag for a subsequent creation', () => {
    component.createClinicalRecord();
    pendingCreation.error(new HttpErrorResponse({ status: 409 }));
    pendingRecovery.next(record);
    pendingRecovery.complete();
    create.mockReturnValue(of(record));

    component.createClinicalRecord();

    expect(component.successMessage).toBe('clinicalRecords.createSuccess');
    expect(component.isCreating).toBe(false);
    expect(create).toHaveBeenCalledTimes(2);
  });

  // Other creation errors

  it.each([
    [400, 'clinicalRecords.createError'],
    [401, 'clinicalRecords.accessDenied'],
    [403, 'clinicalRecords.accessDenied'],
    [0, 'clinicalRecords.connectionError'],
    [500, 'clinicalRecords.createError'],
  ])('handles POST HTTP %s without attempting recovery', (status, message) => {
    component.createClinicalRecord();
    markForCheck.mockClear();

    pendingCreation.error(new HttpErrorResponse({ status }));

    expect(getByPatientId).not.toHaveBeenCalled();
    expect(component.clinicalRecord).toBeNull();
    expect(component.errorMessage).toBe(message);
    expect(component.successMessage).toBe('');
    expect(component.isCreating).toBe(false);
    expect(markForCheck).toHaveBeenCalled();
  });

  // Subscription cleanup

  it.each(['creation', 'recovery'])('cancels pending %s on destruction', (phase) => {
    component.createClinicalRecord();
    if (phase === 'recovery') {
      pendingCreation.error(new HttpErrorResponse({ status: 409 }));
    }
    expect(component.isCreating).toBe(true);
    markForCheck.mockClear();

    component.ngOnDestroy();

    expect(component.isCreating).toBe(false);
    expect(component.isBusy).toBe(false);
    expect(markForCheck).toHaveBeenCalled();
    markForCheck.mockClear();
    pendingCreation.next(record);
    pendingCreation.error(new HttpErrorResponse({ status: 409 }));
    pendingRecovery.next(record);
    pendingRecovery.error(new HttpErrorResponse({ status: 500 }));

    expect(component.clinicalRecord).toBeNull();
    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');
    expect(markForCheck).not.toHaveBeenCalled();
    expect(getByPatientId).toHaveBeenCalledTimes(phase === 'recovery' ? 1 : 0);
  });
});
