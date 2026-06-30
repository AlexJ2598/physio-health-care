import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreatePatient, Patient } from '../../shared/models/patient';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${environment.apiUrl}/Patients`);
  }

  create(patient: CreatePatient): Observable<Patient> {
    return this.http.post<Patient>(
      `${environment.apiUrl}/Patients`,
      patient
    );
  }
}