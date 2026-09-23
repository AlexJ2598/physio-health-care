import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  const executeGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot
      )
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: vi.fn()
          }
        },
        {
          provide: Router,
          useValue: {
            createUrlTree: vi.fn(
              () => ({}) as UrlTree
            )
          }
        }
      ]
    });

    authService = TestBed.inject(
      AuthService
    );

    router = TestBed.inject(
      Router
    );
  });

  it('should allow navigation when user is authenticated', () => {
    vi.mocked(
      authService.isAuthenticated
    ).mockReturnValue(true);

    const result = executeGuard();

    expect(result).toBe(true);

    expect(
      router.createUrlTree
    ).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    const loginUrlTree =
      {} as UrlTree;

    vi.mocked(
      authService.isAuthenticated
    ).mockReturnValue(false);

    vi.mocked(
      router.createUrlTree
    ).mockReturnValue(loginUrlTree);

    const result = executeGuard();

    expect(
      authService.isAuthenticated
    ).toHaveBeenCalled();

    expect(
      router.createUrlTree
    ).toHaveBeenCalledWith([
      '/login'
    ]);

    expect(result).toBe(
      loginUrlTree
    );
  });
});