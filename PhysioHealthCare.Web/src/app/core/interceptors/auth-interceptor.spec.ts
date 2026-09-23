import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { authInterceptor } from './auth-interceptor';
import { AuthService } from '../services/auth';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([
            authInterceptor
          ])
        ),
        provideHttpClientTesting(),
        AuthService,
        {
          provide: Router,
          useValue: {
            navigate: vi.fn()
          }
        }
      ]
    });

    http = TestBed.inject(HttpClient);

    httpMock = TestBed.inject(
      HttpTestingController
    );

    authService = TestBed.inject(
      AuthService
    );

    router = TestBed.inject(Router);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should send request without authorization header when token does not exist', () => {
    http.get('/test').subscribe();

    const request = httpMock.expectOne(
      '/test'
    );

    expect(
      request.request.headers.has(
        'Authorization'
      )
    ).toBeFalsy();

    request.flush({});
  });

  it('should add bearer token when token exists', () => {
    localStorage.setItem(
      'physiohealthcare_token',
      'test-token'
    );

    http.get('/test').subscribe();

    const request = httpMock.expectOne(
      '/test'
    );

    expect(
      request.request.headers.get(
        'Authorization'
      )
    ).toBe(
      'Bearer test-token'
    );

    request.flush({});
  });

  it('should logout and redirect to login when response is 401', () => {
    localStorage.setItem(
      'physiohealthcare_token',
      'test-token'
    );

    const logoutSpy = vi.spyOn(
      authService,
      'logout'
    );

    http.get('/test').subscribe({
      error: () => {}
    });

    const request = httpMock.expectOne(
      '/test'
    );

    request.flush(
      {},
      {
        status: 401,
        statusText: 'Unauthorized'
      }
    );

    expect(
      logoutSpy
    ).toHaveBeenCalled();

    expect(
      localStorage.getItem(
        'physiohealthcare_token'
      )
    ).toBeNull();

    expect(
      router.navigate
    ).toHaveBeenCalledWith([
      '/login'
    ]);
  });

  it('should not logout or redirect when response is 403', () => {
    localStorage.setItem(
      'physiohealthcare_token',
      'test-token'
    );

    const logoutSpy = vi.spyOn(
      authService,
      'logout'
    );

    http.get('/test').subscribe({
      error: () => {}
    });

    const request = httpMock.expectOne(
      '/test'
    );

    request.flush(
      {},
      {
        status: 403,
        statusText: 'Forbidden'
      }
    );

    expect(
      logoutSpy
    ).not.toHaveBeenCalled();

    expect(
      localStorage.getItem(
        'physiohealthcare_token'
      )
    ).toBe('test-token');

    expect(
      router.navigate
    ).not.toHaveBeenCalled();
  });
});