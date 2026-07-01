import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreatePatient, Patient, UpdatePatient } from '../../shared/models/patient';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${environment.apiUrl}/Patients`);
  }

  getById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${environment.apiUrl}/Patients/${id}`);
  }

  create(patient: CreatePatient): Observable<Patient> {
    return this.http.post<Patient>(
      `${environment.apiUrl}/Patients`,
      patient
    );
  }

  update(id: string, patient: UpdatePatient): Observable<Patient> {
    return this.http.put<Patient>(
      `${environment.apiUrl}/Patients/${id}`,
      patient
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.apiUrl}/Patients/${id}`
    );
  }
}