import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  ClinicalHistory,
  CreateClinicalHistory,
  UpdateClinicalHistory,
} from '../../shared/models/clinical-history.model';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClinicalHistoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getByClinicalRecordId(
    clinicalRecordId: string
  ): Observable<ClinicalHistory> {
    return this.http.get<ClinicalHistory>(
      `${this.apiUrl}/clinical-records/${clinicalRecordId}/history`
    );
  }

  create(
    clinicalRecordId: string,
    dto: CreateClinicalHistory
  ): Observable<ClinicalHistory> {
    return this.http.post<ClinicalHistory>(
      `${this.apiUrl}/clinical-records/${clinicalRecordId}/history`,
      dto
    );
  }

  update(
    clinicalRecordId: string,
    dto: UpdateClinicalHistory
  ): Observable<ClinicalHistory> {
    return this.http.put<ClinicalHistory>(
      `${this.apiUrl}/clinical-records/${clinicalRecordId}/history`,
      dto
    );
  }
}
