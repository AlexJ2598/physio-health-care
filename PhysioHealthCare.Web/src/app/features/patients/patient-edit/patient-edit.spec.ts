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
  PatientEditComponent
} from './patient-edit';
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
  PatientDetail,
  UpdatePatient
} from '../../../shared/models/patient';

describe('PatientEditComponent', () => {

  let component: PatientEditComponent;
  let fixture: ComponentFixture<PatientEditComponent>;

  let patientServiceMock: {
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

  const patientDetail: PatientDetail = {
    id: 'patient-1',
    firstName: 'John',
    lastName: 'Doe',
    birthDate: '1990-05-15T00:00:00',
    gender: 1,
    phoneNumber: '1234567890',
    email: 'john@test.com',
    address: 'Test address',
    notes: 'Test notes'
  };

  beforeEach(async () => {

    patientServiceMock = {
      getById: vi.fn(
        () => of(patientDetail)
      ),
      update: vi.fn(
        () => of(patientDetail)
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
        PatientEditComponent
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
                      ? 'patient-1'
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
        PatientEditComponent,
        {
          set: {
            template: ''
          }
        }
      )
      .compileComponents();

    fixture = TestBed.createComponent(
      PatientEditComponent
    );

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load patient on init', () => {

    component.ngOnInit();

    expect(component.patientId).toBe(
      'patient-1'
    );

    expect(
      patientServiceMock.getById
    ).toHaveBeenCalledWith(
      'patient-1'
    );

    expect(component.patient).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      birthDate: '1990-05-15',
      gender: 1,
      phoneNumber: '1234567890',
      email: 'john@test.com',
      address: 'Test address',
      notes: 'Test notes'
    });

    expect(component.isLoading)
      .toBeFalsy();
  });

  it('should translate a key', () => {

    translationServiceMock.translate
      .mockReturnValue(
        'Edit patient'
      );

    const result = component.t(
      'patients.edit.title'
    );

    expect(
      translationServiceMock.translate
    ).toHaveBeenCalledWith(
      'patients.edit.title'
    );

    expect(result).toBe(
      'Edit patient'
    );
  });

  it('should navigate to not found when patient does not exist', () => {

    patientServiceMock.getById
      .mockReturnValue(
        throwError(() => ({
          status: 404
        }))
      );

    component.patientId =
      'patient-1';

    component.loadPatient();

    expect(
      routerMock.navigate
    ).toHaveBeenCalledWith([
      '/not-found'
    ]);
  });

  it('should show error when loading patient fails', () => {

    patientServiceMock.getById
      .mockReturnValue(
        throwError(() => ({
          status: 500
        }))
      );

    component.patientId =
      'patient-1';

    component.loadPatient();

    expect(component.isLoading)
      .toBeFalsy();

    expect(component.errorMessage)
      .toBe(
        'patients.edit.loadError'
      );
  });

  it('should validate required fields', () => {

    component.patient = {
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: 1,
      phoneNumber: '',
      email: '',
      address: '',
      notes: ''
    };

    component.updatePatient();

    expect(component.formSubmitted)
      .toBeTruthy();

    expect(component.errorMessage)
      .toBe(
        'patients.validation.requiredFields'
      );

    expect(
      patientServiceMock.update
    ).not.toHaveBeenCalled();
  });

  it('should reject invalid gender', () => {

    component.patient = {
      ...validPatient(),
      gender: 4 as any
    };

    component.updatePatient();

    expect(component.errorMessage)
      .toBe(
        'patients.validation.requiredFields'
      );

    expect(
      patientServiceMock.update
    ).not.toHaveBeenCalled();
  });

  it('should reject today as birth date', () => {

    const now = new Date();

    const today = [
      now.getFullYear(),
      String(
        now.getMonth() + 1
      ).padStart(2, '0'),
      String(
        now.getDate()
      ).padStart(2, '0')
    ].join('-');

    component.patient = {
      ...validPatient(),
      birthDate: today
    };

    component.updatePatient();

    expect(component.errorMessage)
      .toBe(
        'patients.validation.birthDatePast'
      );

    expect(
      patientServiceMock.update
    ).not.toHaveBeenCalled();
  });

  it('should not update while already saving', () => {

    component.patient =
      validPatient();

    component.isSaving = true;

    component.updatePatient();

    expect(
      patientServiceMock.update
    ).not.toHaveBeenCalled();
  });

  it('should update patient successfully', () => {

    component.patientId =
      'patient-1';

    component.patient =
      validPatient();

    component.updatePatient();

    expect(
      patientServiceMock.update
    ).toHaveBeenCalledWith(
      'patient-1',
      component.patient
    );

    expect(component.isSaving)
      .toBeFalsy();

    expect(
      toastServiceMock.success
    ).toHaveBeenCalledWith(
      'patients.edit.success'
    );

    expect(
      routerMock.navigate
    ).toHaveBeenCalledWith([
      '/patients'
    ]);
  });

  it('should show API error message when update fails', () => {

    patientServiceMock.update
      .mockReturnValue(
        throwError(() => ({
          error: {
            message:
              'Patient could not be updated'
          }
        }))
      );

    component.patientId =
      'patient-1';

    component.patient =
      validPatient();

    component.updatePatient();

    expect(component.isSaving)
      .toBeFalsy();

    expect(component.errorMessage)
      .toBe(
        'Patient could not be updated'
      );
  });

  it('should use translated fallback when API error has no message', () => {

    patientServiceMock.update
      .mockReturnValue(
        throwError(() => ({
          error: {}
        }))
      );

    component.patientId =
      'patient-1';

    component.patient =
      validPatient();

    component.updatePatient();

    expect(component.errorMessage)
      .toBe(
        'patients.edit.error'
      );
  });

  it('should return yesterday as max birth date', () => {

    const yesterday = new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const expected = [
      yesterday.getFullYear(),
      String(
        yesterday.getMonth() + 1
      ).padStart(2, '0'),
      String(
        yesterday.getDate()
      ).padStart(2, '0')
    ].join('-');

    expect(component.maxBirthDate)
      .toBe(expected);
  });

  function validPatient(): UpdatePatient {
    return {
      firstName: 'John',
      lastName: 'Doe',
      birthDate: '1990-05-15',
      gender: 1,
      phoneNumber: '1234567890',
      email: 'john@test.com',
      address: 'Test address',
      notes: 'Test notes'
    };
  }

});