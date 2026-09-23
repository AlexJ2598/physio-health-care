import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  BehaviorSubject,
  of,
  throwError
} from 'rxjs';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  PatientListComponent
} from './patient-list';
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
  Patient
} from '../../../shared/models/patient';

describe('PatientListComponent', () => {

  let component: PatientListComponent;
  let fixture: ComponentFixture<PatientListComponent>;

  let patientServiceMock: {
    getAll: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  let toastServiceMock: {
    success: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
  };

  let translationServiceMock: {
    language$: BehaviorSubject<string>;
    translate: ReturnType<typeof vi.fn>;
  };

  const patient: Patient = {
    id: 'patient-1',
    fullName: 'Juan Perez',
    birthDate: '1990-01-01',
    gender: 'Male',
    phoneNumber: '1234567890',
    email: 'juan@test.com'
  };

  beforeEach(async () => {

    patientServiceMock = {
      getAll: vi.fn(),
      delete: vi.fn()
    };

    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };

    translationServiceMock = {
      language$: new BehaviorSubject<string>(
        'es'
      ),
      translate: vi.fn(
        (key: string) => key
      )
    };

    patientServiceMock.getAll.mockReturnValue(
      of({
        items: [],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 0
      })
    );

    await TestBed.configureTestingModule({
      imports: [
        PatientListComponent
      ],
      providers: [
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
    })
      .overrideComponent(
        PatientListComponent,
        {
          set: {
            template: ''
          }
        }
      )
      .compileComponents();

    fixture = TestBed.createComponent(
      PatientListComponent
    );

    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load patients', () => {

    patientServiceMock.getAll.mockReturnValue(
      of({
        items: [patient],
        pageNumber: 1,
        pageSize: 10,
        totalCount: 1,
        totalPages: 1
      })
    );

    component.loadPatients();

    expect(
      patientServiceMock.getAll
    ).toHaveBeenCalledWith(
      1,
      10,
      '',
      undefined,
      'asc'
    );

    expect(component.patients).toEqual([
      patient
    ]);

    expect(component.totalCount).toBe(1);
    expect(component.totalPages).toBe(1);
    expect(component.isLoading).toBeFalsy();
  });

  it('should show error when loading patients fails', () => {

    patientServiceMock.getAll.mockReturnValue(
      throwError(() => new Error(
        'Load error'
      ))
    );

    component.loadPatients();

    expect(component.isLoading).toBeFalsy();

    expect(
      component.errorMessage
    ).toBe('patients.loadError');
  });

  it('should reload patients after search debounce', () => {

    vi.useFakeTimers();

    const loadPatientsSpy = vi.spyOn(
      component,
      'loadPatients'
    );

    component.pageNumber = 3;
    component.searchTerm = 'Juan';

    component.onSearchChange();

    expect(
      loadPatientsSpy
    ).not.toHaveBeenCalled();

    vi.advanceTimersByTime(399);

    expect(
      loadPatientsSpy
    ).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(component.pageNumber).toBe(1);

    expect(
      loadPatientsSpy
    ).toHaveBeenCalledTimes(1);
  });

  it('should sort ascending when selecting a new field', () => {

    const loadPatientsSpy = vi.spyOn(
      component,
      'loadPatients'
    );

    component.pageNumber = 3;

    component.sort('fullName');

    expect(component.sortBy).toBe(
      'fullName'
    );

    expect(component.sortDirection).toBe(
      'asc'
    );

    expect(component.pageNumber).toBe(1);

    expect(
      loadPatientsSpy
    ).toHaveBeenCalledTimes(1);
  });

  it('should toggle sort direction for the same field', () => {

    const loadPatientsSpy = vi.spyOn(
      component,
      'loadPatients'
    );

    component.sortBy = 'fullName';
    component.sortDirection = 'asc';

    component.sort('fullName');

    expect(component.sortDirection).toBe(
      'desc'
    );

    component.sort('fullName');

    expect(component.sortDirection).toBe(
      'asc'
    );

    expect(
      loadPatientsSpy
    ).toHaveBeenCalledTimes(2);
  });

  it('should not sort while loading', () => {

    const loadPatientsSpy = vi.spyOn(
      component,
      'loadPatients'
    );

    component.isLoading = true;

    component.sort('fullName');

    expect(
      loadPatientsSpy
    ).not.toHaveBeenCalled();
  });

  it('should return correct sort indicator', () => {

    component.sortBy = 'fullName';
    component.sortDirection = 'asc';

    expect(
      component.getSortIndicator(
        'fullName'
      )
    ).toBe('↑');

    component.sortDirection = 'desc';

    expect(
      component.getSortIndicator(
        'fullName'
      )
    ).toBe('↓');

    expect(
      component.getSortIndicator(
        'birthDate'
      )
    ).toBe('');
  });

  it('should go to previous page', () => {

    const loadPatientsSpy = vi.spyOn(
      component,
      'loadPatients'
    );

    component.pageNumber = 2;
    component.totalPages = 3;

    component.previousPage();

    expect(component.pageNumber).toBe(1);

    expect(
      loadPatientsSpy
    ).toHaveBeenCalledTimes(1);
  });

  it('should not go before first page', () => {

    const loadPatientsSpy = vi.spyOn(
      component,
      'loadPatients'
    );

    component.pageNumber = 1;

    component.previousPage();

    expect(component.pageNumber).toBe(1);

    expect(
      loadPatientsSpy
    ).not.toHaveBeenCalled();
  });

  it('should go to next page', () => {

    patientServiceMock.getAll.mockReturnValue(
      of({
        items: [],
        pageNumber: 2,
        pageSize: 10,
        totalCount: 30,
        totalPages: 3
      })
    );

    component.pageNumber = 1;
    component.totalPages = 3;

    component.nextPage();

    expect(component.pageNumber).toBe(2);

    expect(
      patientServiceMock.getAll
    ).toHaveBeenCalledWith(
      2,
      10,
      '',
      undefined,
      'asc'
    );
  });

  it('should not go beyond last page', () => {

    const loadPatientsSpy = vi.spyOn(
      component,
      'loadPatients'
    );

    component.pageNumber = 3;
    component.totalPages = 3;

    component.nextPage();

    expect(component.pageNumber).toBe(3);

    expect(
      loadPatientsSpy
    ).not.toHaveBeenCalled();
  });

  it('should go to a specific page', () => {

    patientServiceMock.getAll.mockReturnValue(
      of({
        items: [],
        pageNumber: 4,
        pageSize: 10,
        totalCount: 50,
        totalPages: 5
      })
    );

    component.pageNumber = 1;
    component.totalPages = 5;

    component.goToPage(4);

    expect(component.pageNumber).toBe(4);

    expect(
      patientServiceMock.getAll
    ).toHaveBeenCalledWith(
      4,
      10,
      '',
      undefined,
      'asc'
    );
  });

  it('should generate page numbers', () => {

    component.totalPages = 4;

    expect(component.pages).toEqual([
      1,
      2,
      3,
      4
    ]);
  });

  it('should open delete modal', () => {

    component.openDeleteModal(patient);

    expect(
      component.selectedPatient
    ).toEqual(patient);

    expect(
      component.showDeleteModal
    ).toBeTruthy();
  });

  it('should close delete modal', () => {

    component.selectedPatient = patient;
    component.showDeleteModal = true;

    component.closeDeleteModal();

    expect(
      component.selectedPatient
    ).toBeNull();

    expect(
      component.showDeleteModal
    ).toBeFalsy();
  });

  it('should delete selected patient', () => {

    patientServiceMock.delete.mockReturnValue(
      of(undefined)
    );

    const loadPatientsSpy = vi.spyOn(
      component,
      'loadPatients'
    );

    component.patients = [patient];
    component.selectedPatient = patient;
    component.showDeleteModal = true;

    component.confirmDelete();

    expect(
      patientServiceMock.delete
    ).toHaveBeenCalledWith(
      patient.id
    );

    expect(
      toastServiceMock.success
    ).toHaveBeenCalledWith(
      'patients.deletedSuccess'
    );

    expect(
      component.showDeleteModal
    ).toBeFalsy();

    expect(
      component.selectedPatient
    ).toBeNull();

    expect(
      component.isDeleting
    ).toBeFalsy();

    expect(
      loadPatientsSpy
    ).toHaveBeenCalledTimes(1);
  });

  it('should move to previous page when deleting the last patient on a page', () => {

    patientServiceMock.delete.mockReturnValue(
      of(undefined)
    );

    vi.spyOn(
      component,
      'loadPatients'
    );

    component.patients = [patient];
    component.pageNumber = 2;
    component.totalPages = 2;
    component.selectedPatient = patient;

    component.confirmDelete();

    expect(component.pageNumber).toBe(1);
  });

  it('should show toast when deletion fails', () => {

    patientServiceMock.delete.mockReturnValue(
      throwError(() => new Error(
        'Delete error'
      ))
    );

    component.selectedPatient = patient;

    component.confirmDelete();

    expect(
      component.isDeleting
    ).toBeFalsy();

    expect(
      toastServiceMock.error
    ).toHaveBeenCalledWith(
      'patients.deleteError'
    );
  });

  it('should not delete without selected patient', () => {

    component.selectedPatient = null;

    component.confirmDelete();

    expect(
      patientServiceMock.delete
    ).not.toHaveBeenCalled();
  });

  it('should translate patient gender', () => {

    expect(
      component.getGenderTranslation(
        'Male'
      )
    ).toBe(
      'patients.gender.male'
    );

    expect(
      component.getGenderTranslation(
        'Female'
      )
    ).toBe(
      'patients.gender.female'
    );

    expect(
      component.getGenderTranslation(
        'Other'
      )
    ).toBe(
      'patients.gender.other'
    );
  });

  it('should update locale when language changes', () => {

    component.ngOnInit();

    expect(
      component.currentLocale
    ).toBe('es-MX');

    translationServiceMock.language$
      .next('en');

    expect(
      component.currentLocale
    ).toBe('en-US');
  });

});