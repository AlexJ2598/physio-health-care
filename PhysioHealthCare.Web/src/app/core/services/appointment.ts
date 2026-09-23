import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Appointment,
  AppointmentFilters,
  CreateAppointment,
  UpdateAppointment,
  UpdateAppointmentStatus
} from '../../shared/models/appointment';
import { PagedResult } from '../../shared/models/paged-result';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(
    private http: HttpClient
  ) {}

  getAll(
    pageNumber: number = 1,
    pageSize: number = 10,
    filters: AppointmentFilters = {}
  ): Observable<PagedResult<Appointment>> {

    let params = new HttpParams()
      .set(
        'pageNumber',
        pageNumber.toString()
      )
      .set(
        'pageSize',
        pageSize.toString()
      )
      .set(
        'sortDirection',
        filters.sortDirection ?? 'asc'
      );

    if (filters.patientId) {
      params = params.set(
        'patientId',
        filters.patientId
      );
    }

    if (filters.status) {
      params = params.set(
        'status',
        filters.status.toString()
      );
    }

    if (filters.dateFrom) {
      params = params.set(
        'dateFrom',
        filters.dateFrom
      );
    }

    if (filters.dateTo) {
      params = params.set(
        'dateTo',
        filters.dateTo
      );
    }

    if (filters.search?.trim()) {
      params = params.set(
        'search',
        filters.search.trim()
      );
    }

    if (filters.sortBy) {
      params = params.set(
        'sortBy',
        filters.sortBy
      );
    }

    return this.http.get<PagedResult<Appointment>>(
      `${environment.apiUrl}/Appointments`,
      { params }
    );
  }

  getById(
    id: string
  ): Observable<Appointment> {

    return this.http.get<Appointment>(
      `${environment.apiUrl}/Appointments/${id}`
    );
  }

  create(
    appointment: CreateAppointment
  ): Observable<Appointment> {

    return this.http.post<Appointment>(
      `${environment.apiUrl}/Appointments`,
      appointment
    );
  }

  update(
    id: string,
    appointment: UpdateAppointment
  ): Observable<Appointment> {

    return this.http.put<Appointment>(
      `${environment.apiUrl}/Appointments/${id}`,
      appointment
    );
  }

  updateStatus(
    id: string,
    status: UpdateAppointmentStatus
  ): Observable<Appointment> {

    return this.http.patch<Appointment>(
      `${environment.apiUrl}/Appointments/${id}/status`,
      status
    );
  }

  delete(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${environment.apiUrl}/Appointments/${id}`
    );
  }
}