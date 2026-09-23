import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../../shared/models/auth-response';
import { Login } from '../../shared/models/login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'physiohealthcare_token';

  constructor(private http: HttpClient) {}

  login(dto: Login): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/Auth/login`, dto)
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.token);
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
  const token = this.getToken();

  if (!token) {
    return false;
  }

  try {
    const payload = JSON.parse(
      atob(token.split('.')[1])
    );

    if (!payload.exp) {
      this.logout();
      return false;
    }

    const expirationTime =
      payload.exp * 1000;

    if (Date.now() >= expirationTime) {
      this.logout();
      return false;
    }

    return true;
  } catch {
    this.logout();
    return false;
  }
 }
}