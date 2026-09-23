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
  PatientCreateComponent
} from './patient-create';
import {
  PatientService
} from '../../../core/services/patient';
import {
  ToastService
} from '../../../core/services/toast';
import {
  TranslationService
} from '../../../core/services/translation';

describe('PatientCreateComponent', () => {

  let component: PatientCreateComponent;
  let fixture: ComponentFixture<PatientCreateComponent>;

  let patientServiceMock: {
    create: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  let toastServiceMock: {
    success: ReturnType<typeof vi.fn>;
  };

  let translationServiceMock: {
    language$: BehaviorSubject<string>;
    translate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {

    patientServiceMock = {
      create: vi.fn()
    };

    routerMock = {
      navigate: vi.fn()
    };

    toastServiceMock = {
      success: vi.fn()
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
        PatientCreateComponent
      ],
      providers: [
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
        PatientCreateComponent,
        {
          set: {
            template: ''
          }
        }
      )
      .compileComponents();

    fixture = TestBed.createComponent(
      PatientCreateComponent
    );

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize patient with default values', () => {
    expect(component.patient).toEqual({
      firstName: '',
      lastName: '',
      birthDate: '',
      gender: 1,
      phoneNumber: '',
      email: '',
      address: '',
      notes: ''
    });
  });

  it('should translate a key', () => {
    translationServiceMock.translate
      .mockReturnValue(
        'Translated text'
      );

    const result = component.t(
      'patients.create.title'
    );

    expect(
      translationServiceMock.translate
    ).toHaveBeenCalledWith(
      'patients.create.title'
    );

    expect(result).toBe(
      'Translated text'
    );
  });

  it('should not create patient when required fields are missing', () => {
    component.createPatient();

    expect(
      component.formSubmitted
    ).toBeTruthy();

    expect(
      component.errorMessage
    ).toBe(
      'patients.validation.requiredFields'
    );

    expect(
      patientServiceMock.create
    ).not.toHaveBeenCalled();
  });

  it('should not create patient when gender is invalid', () => {
    component.patient = {
      firstName: 'Juan',
      lastName: 'Perez',
      birthDate: '1990-01-01',
      gender: 4 as any,
      phoneNumber: '',
      email: '',
      address: '',
      notes: ''
    };

    component.createPatient();

    expect(
      component.errorMessage
    ).toBe(
      'patients.validation.requiredFields'
    );

    expect(
      patientServiceMock.create
    ).not.toHaveBeenCalled();
  });

  it('should not create patient when birth date is today', () => {
    const today = new Date();

    const year =
      today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      today.getDate()
    ).padStart(2, '0');

    component.patient = {
      firstName: 'Juan',
      lastName: 'Perez',
      birthDate:
        `${year}-${month}-${day}`,
      gender: 1,
      phoneNumber: '',
      email: '',
      address: '',
      notes: ''
    };

    component.createPatient();

    expect(
      component.errorMessage
    ).toBe(
      'patients.validation.birthDatePast'
    );

    expect(
      patientServiceMock.create
    ).not.toHaveBeenCalled();
  });

  it('should not create patient when birth date is in the future', () => {
    component.patient = {
      firstName: 'Juan',
      lastName: 'Perez',
      birthDate: '2999-01-01',
      gender: 1,
      phoneNumber: '',
      email: '',
      address: '',
      notes: ''
    };

    component.createPatient();

    expect(
      component.errorMessage
    ).toBe(
      'patients.validation.birthDatePast'
    );

    expect(
      patientServiceMock.create
    ).not.toHaveBeenCalled();
  });

  it('should prevent multiple requests while loading', () => {
    component.isLoading = true;

    component.createPatient();

    expect(
      patientServiceMock.create
    ).not.toHaveBeenCalled();
  });

  it('should create patient successfully', () => {
    patientServiceMock.create
      .mockReturnValue(
        of({
          id: 'patient-1',
          fullName: 'Juan Perez',
          birthDate: '1990-01-01',
          gender: 'Male',
          phoneNumber: '',
          email: ''
        })
      );

    component.patient = {
      firstName: 'Juan',
      lastName: 'Perez',
      birthDate: '1990-01-01',
      gender: 1,
      phoneNumber: '',
      email: '',
      address: '',
      notes: ''
    };

    component.createPatient();

    expect(
      patientServiceMock.create
    ).toHaveBeenCalledWith(
      component.patient
    );

    expect(
      component.isLoading
    ).toBeFalsy();

    expect(
      toastServiceMock.success
    ).toHaveBeenCalledWith(
      'patients.create.success'
    );

    expect(
      routerMock.navigate
    ).toHaveBeenCalledWith([
      '/patients'
    ]);
  });

  it('should show API error message when creation fails', () => {
    patientServiceMock.create
      .mockReturnValue(
        throwError(() => ({
          error: {
            message:
              'Patient could not be created'
          }
        }))
      );

    component.patient = {
      firstName: 'Juan',
      lastName: 'Perez',
      birthDate: '1990-01-01',
      gender: 1,
      phoneNumber: '',
      email: '',
      address: '',
      notes: ''
    };

    component.createPatient();

    expect(
      component.isLoading
    ).toBeFalsy();

    expect(
      component.errorMessage
    ).toBe(
      'Patient could not be created'
    );
  });

  it('should use translated fallback when API error has no message', () => {
    translationServiceMock.translate
      .mockImplementation(
        (key: string) => {
          if (
            key ===
            'patients.create.error'
          ) {
            return 'Could not create patient';
          }

          return key;
        }
      );

    patientServiceMock.create
      .mockReturnValue(
        throwError(() => ({
          error: {}
        }))
      );

    component.patient = {
      firstName: 'Juan',
      lastName: 'Perez',
      birthDate: '1990-01-01',
      gender: 1,
      phoneNumber: '',
      email: '',
      address: '',
      notes: ''
    };

    component.createPatient();

    expect(
      component.errorMessage
    ).toBe(
      'Could not create patient'
    );
  });

  it('should return yesterday as max birth date', () => {
    const yesterday = new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const expected =
      `${yesterday.getFullYear()}-` +
      `${String(
        yesterday.getMonth() + 1
      ).padStart(2, '0')}-` +
      `${String(
        yesterday.getDate()
      ).padStart(2, '0')}`;

    expect(
      component.maxBirthDate
    ).toBe(expected);
  });

});