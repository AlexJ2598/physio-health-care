import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DashboardSummary } from '../../shared/models/dashboard-summary.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private readonly http: HttpClient) {}

  getSummary(): Observable<DashboardSummary> {
    const now = new Date();

    const dateFrom = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );

    const dateTo = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    const params = new HttpParams()
      .set('dateFrom', dateFrom.toISOString())
      .set('dateTo', dateTo.toISOString());

    return this.http.get<DashboardSummary>(
      `${environment.apiUrl}/Dashboard`,
      { params }
    );
  }
}