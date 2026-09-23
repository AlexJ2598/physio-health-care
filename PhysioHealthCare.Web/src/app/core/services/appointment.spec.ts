import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { AppointmentService } from './appointment';
import { environment } from '../../../environments/environment';
import {
  Appointment,
  CreateAppointment,
  UpdateAppointment,
  UpdateAppointmentStatus
} from '../../shared/models/appointment';
import { PagedResult } from '../../shared/models/paged-result';

describe('AppointmentService', () => {

  let service: AppointmentService;
  let httpMock: HttpTestingController;

  const appointment: Appointment = {
    id: 'appointment-1',
    patientId: 'patient-1',
    patientName: 'Juan Perez Galicia',
    appointmentDate: '2026-09-25T18:00:00Z',
    reason: 'Consulta',
    notes: 'Test appointment',
    status: 'Scheduled'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppointmentService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AppointmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get paged appointments', () => {
    const response: PagedResult<Appointment> = {
      items: [appointment],
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
        req.url === `${environment.apiUrl}/Appointments` &&
        req.params.get('pageNumber') === '1' &&
        req.params.get('pageSize') === '10' &&
        req.params.get('sortDirection') === 'asc'
    );

    expect(request.request.method).toBe('GET');

    request.flush(response);
  });

  it('should send appointment filters', () => {
    service.getAll(
      2,
      5,
      {
        patientId: 'patient-1',
        status: 2,
        dateFrom: '2026-09-20T00:00:00Z',
        dateTo: '2026-09-30T23:59:59Z',
        search: 'Juan',
        sortBy: 'appointmentDate',
        sortDirection: 'desc'
      }
    ).subscribe();

    const request = httpMock.expectOne(
      req =>
        req.url === `${environment.apiUrl}/Appointments`
    );

    expect(request.request.method).toBe('GET');

    expect(
      request.request.params.get('pageNumber')
    ).toBe('2');

    expect(
      request.request.params.get('pageSize')
    ).toBe('5');

    expect(
      request.request.params.get('patientId')
    ).toBe('patient-1');

    expect(
      request.request.params.get('status')
    ).toBe('2');

    expect(
      request.request.params.get('dateFrom')
    ).toBe('2026-09-20T00:00:00Z');

    expect(
      request.request.params.get('dateTo')
    ).toBe('2026-09-30T23:59:59Z');

    expect(
      request.request.params.get('search')
    ).toBe('Juan');

    expect(
      request.request.params.get('sortBy')
    ).toBe('appointmentDate');

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

  it('should trim search before sending it', () => {
    service.getAll(
      1,
      10,
      {
        search: '  Juan  '
      }
    ).subscribe();

    const request = httpMock.expectOne(
      req =>
        req.url === `${environment.apiUrl}/Appointments`
    );

    expect(
      request.request.params.get('search')
    ).toBe('Juan');

    request.flush({
      items: [],
      pageNumber: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0
    });
  });

  it('should get appointment by id', () => {
    service.getById(
      appointment.id
    ).subscribe(result => {
      expect(result).toEqual(appointment);
    });

    const request = httpMock.expectOne(
      `${environment.apiUrl}/Appointments/${appointment.id}`
    );

    expect(request.request.method).toBe('GET');

    request.flush(appointment);
  });

  it('should create an appointment', () => {
    const dto: CreateAppointment = {
      patientId: 'patient-1',
      appointmentDate: '2026-09-25T18:00:00Z',
      reason: 'Consulta',
      notes: 'Test appointment'
    };

    service.create(dto).subscribe(result => {
      expect(result).toEqual(appointment);
    });

    const request = httpMock.expectOne(
      `${environment.apiUrl}/Appointments`
    );

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(dto);

    request.flush(appointment);
  });

  it('should update an appointment', () => {
    const dto: UpdateAppointment = {
      appointmentDate: '2026-09-26T19:30:00Z',
      reason: 'Consulta actualizada',
      notes: 'Updated appointment'
    };

    service.update(
      appointment.id,
      dto
    ).subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/Appointments/${appointment.id}`
    );

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(dto);

    request.flush({
      ...appointment,
      ...dto
    });
  });

  it('should update appointment status', () => {
    const dto: UpdateAppointmentStatus = {
      status: 2
    };

    service.updateStatus(
      appointment.id,
      dto
    ).subscribe(result => {
      expect(result.status).toBe('InProgress');
    });

    const request = httpMock.expectOne(
      `${environment.apiUrl}/Appointments/${appointment.id}/status`
    );

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(dto);

    request.flush({
      ...appointment,
      status: 'InProgress'
    });
  });

  it('should delete an appointment', () => {
    service.delete(
      appointment.id
    ).subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/Appointments/${appointment.id}`
    );

    expect(request.request.method).toBe('DELETE');

    request.flush(null);
  });

});