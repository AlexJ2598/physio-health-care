import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { PatientService } from './patient';
import { environment } from '../../../environments/environment';
import {
  CreatePatient,
  Patient,
  PatientDetail,
  UpdatePatient
} from '../../shared/models/patient';
import { PagedResult } from '../../shared/models/paged-result';

describe('PatientService', () => {

  let service: PatientService;
  let httpMock: HttpTestingController;

  const patient: Patient = {
    id: 'patient-1',
    fullName: 'Juan Perez Galicia',
    birthDate: '1990-01-01',
    gender: 'Male',
    phoneNumber: '1234567890',
    email: 'juan@example.com'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PatientService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get paged patients', () => {
    const response: PagedResult<Patient> = {
      items: [patient],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1
    };

    service.getAll().subscribe(result => {
      expect(result).toEqual(response);
    });

    const request = httpMock.expectOne(
      req =>
        req.url === `${environment.apiUrl}/Patients` &&
        req.params.get('pageNumber') === '1' &&
        req.params.get('pageSize') === '10'
    );

    expect(request.request.method).toBe('GET');

    request.flush(response);
  });

  it('should send search and sorting parameters', () => {
    service.getAll(
      2,
      5,
      '  Juan  ',
      'fullName',
      'desc'
    ).subscribe();

    const request = httpMock.expectOne(
      req =>
        req.url === `${environment.apiUrl}/Patients`
    );

    expect(request.request.method).toBe('GET');

    expect(
      request.request.params.get('pageNumber')
    ).toBe('2');

    expect(
      request.request.params.get('pageSize')
    ).toBe('5');

    expect(
      request.request.params.get('search')
    ).toBe('Juan');

    expect(
      request.request.params.get('sortBy')
    ).toBe('fullName');

    expect(
      request.request.params.get('sortDirection')
    ).toBe('desc');

    request.flush({
      items: [],
      pageNumber: 2,
      pageSize: 5,
      totalCount: 0,
      totalPages: 0
    });
  });

  it('should get patient by id', () => {
    const detail: PatientDetail = {
      id: 'patient-1',
      firstName: 'Juan',
      lastName: 'Perez Galicia',
      birthDate: '1990-01-01',
      gender: 1,
      phoneNumber: '1234567890',
      email: 'juan@example.com',
      address: null,
      notes: null
    };

    service.getById(
      detail.id
    ).subscribe(result => {
      expect(result).toEqual(detail);
    });

    const request = httpMock.expectOne(
      `${environment.apiUrl}/Patients/${detail.id}`
    );

    expect(request.request.method).toBe('GET');

    request.flush(detail);
  });

  it('should create a patient', () => {
    const dto: CreatePatient = {
      firstName: 'Juan',
      lastName: 'Perez Galicia',
      birthDate: '1990-01-01',
      gender: 1,
      phoneNumber: '1234567890',
      email: 'juan@example.com'
    };

    service.create(dto).subscribe(result => {
      expect(result).toEqual(patient);
    });

    const request = httpMock.expectOne(
      `${environment.apiUrl}/Patients`
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(dto);

    request.flush(patient);
  });

  it('should update a patient', () => {
    const dto: UpdatePatient = {
      firstName: 'Juan',
      lastName: 'Perez Galicia',
      birthDate: '1990-01-01',
      gender: 1,
      phoneNumber: '1234567890',
      email: 'juan.updated@example.com'
    };

    service.update(
      patient.id,
      dto
    ).subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/Patients/${patient.id}`
    );

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(dto);

    request.flush(patient);
  });

  it('should delete a patient', () => {
    service.delete(
      patient.id
    ).subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/Patients/${patient.id}`
    );

    expect(request.request.method).toBe('DELETE');

    request.flush(null);
  });

});