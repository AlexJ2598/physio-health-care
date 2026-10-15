
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ClinicalRecord } from '../../shared/models/clinical-record.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClinicalRecordService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getByPatientId(patientId: string): Observable<ClinicalRecord> {
    return this.http.get<ClinicalRecord>(
      `${this.apiUrl}/patients/${patientId}/clinical-record`
    );
  }

  create(patientId: string): Observable<ClinicalRecord> {
    return this.http.post<ClinicalRecord>(
      `${this.apiUrl}/patients/${patientId}/clinical-record`,
      null
    );
  }
}
