import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  CreatePatient,
  Patient,
  PatientDetail,
  UpdatePatient
} from '../../shared/models/patient';

import { PagedResult } from '../../shared/models/paged-result';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(
    private http: HttpClient
  ) {}

  getAll(
    pageNumber: number = 1,
    pageSize: number = 10,
    search?: string
  ): Observable<PagedResult<Patient>> {

    let params = new HttpParams()
      .set(
        'pageNumber',
        pageNumber.toString()
      )
      .set(
        'pageSize',
        pageSize.toString()
      );

    if (search?.trim()) {
      params = params.set(
        'search',
        search.trim()
      );
    }

    return this.http.get<PagedResult<Patient>>(
      `${environment.apiUrl}/Patients`,
      { params }
    );
  }

  getById(
    id: string
  ): Observable<PatientDetail> {

    return this.http.get<PatientDetail>(
      `${environment.apiUrl}/Patients/${id}`
    );
  }

  create(
    patient: CreatePatient
  ): Observable<Patient> {

    return this.http.post<Patient>(
      `${environment.apiUrl}/Patients`,
      patient
    );
  }

  update(
    id: string,
    patient: UpdatePatient
  ): Observable<Patient> {

    return this.http.put<Patient>(
      `${environment.apiUrl}/Patients/${id}`,
      patient
    );
  }

  delete(
    id: string
  ): Observable<void> {

    return this.http.delete<void>(
      `${environment.apiUrl}/Patients/${id}`
    );
  }
}