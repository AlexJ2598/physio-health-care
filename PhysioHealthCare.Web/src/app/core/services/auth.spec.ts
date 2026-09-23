import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from './auth';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../../shared/models/auth-response';
import { Login } from '../../shared/models/login';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const tokenKey = 'physiohealthcare_token';

  const createToken = (
    expirationTime: number
  ): string => {
    const header = btoa(
      JSON.stringify({
        alg: 'HS256',
        typ: 'JWT'
      })
    );

    const payload = btoa(
      JSON.stringify({
        exp: expirationTime
      })
    );

    return `${header}.${payload}.test-signature`;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);

    httpMock = TestBed.inject(
      HttpTestingController
    );

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and store token', () => {
    const dto: Login = {
      email: 'admin@test.com',
      password: 'Password123!'
    };

    const response: AuthResponse = {
      token: 'test-jwt-token',
      userId: 'user-1',
      fullName: 'Admin User',
      email: 'admin@test.com',
      role: 'Admin'
    };

    service.login(dto).subscribe(result => {
      expect(result).toEqual(response);

      expect(
        localStorage.getItem(tokenKey)
      ).toBe(response.token);
    });

    const request = httpMock.expectOne(
      `${environment.apiUrl}/Auth/login`
    );

    expect(
      request.request.method
    ).toBe('POST');

    expect(
      request.request.body
    ).toEqual(dto);

    request.flush(response);
  });

  it('should return stored token', () => {
    localStorage.setItem(
      tokenKey,
      'stored-token'
    );

    expect(
      service.getToken()
    ).toBe('stored-token');
  });

  it('should return null when token does not exist', () => {
    expect(
      service.getToken()
    ).toBeNull();
  });

  it('should remove token on logout', () => {
    localStorage.setItem(
      tokenKey,
      'stored-token'
    );

    service.logout();

    expect(
      localStorage.getItem(tokenKey)
    ).toBeNull();
  });

  it('should return true when token is valid and not expired', () => {
    const futureExpiration =
      Math.floor(Date.now() / 1000) + 3600;

    const token = createToken(
      futureExpiration
    );

    localStorage.setItem(
      tokenKey,
      token
    );

    expect(
      service.isAuthenticated()
    ).toBeTruthy();

    expect(
      localStorage.getItem(tokenKey)
    ).toBe(token);
  });

  it('should return false when token does not exist', () => {
    expect(
      service.isAuthenticated()
    ).toBeFalsy();
  });

  it('should return false and remove expired token', () => {
    const pastExpiration =
      Math.floor(Date.now() / 1000) - 3600;

    localStorage.setItem(
      tokenKey,
      createToken(pastExpiration)
    );

    expect(
      service.isAuthenticated()
    ).toBeFalsy();

    expect(
      localStorage.getItem(tokenKey)
    ).toBeNull();
  });

  it('should return false and remove malformed token', () => {
    localStorage.setItem(
      tokenKey,
      'invalid-token'
    );

    expect(
      service.isAuthenticated()
    ).toBeFalsy();

    expect(
      localStorage.getItem(tokenKey)
    ).toBeNull();
  });

  it('should return false and remove token without expiration', () => {
    const header = btoa(
      JSON.stringify({
        alg: 'HS256',
        typ: 'JWT'
      })
    );

    const payload = btoa(
      JSON.stringify({
        sub: 'user-1'
      })
    );

    const token =
      `${header}.${payload}.test-signature`;

    localStorage.setItem(
      tokenKey,
      token
    );

    expect(
      service.isAuthenticated()
    ).toBeFalsy();

    expect(
      localStorage.getItem(tokenKey)
    ).toBeNull();
  });
});