import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  of,
  throwError
} from 'rxjs';
import {
  describe,
  expect,
  it,
  beforeEach,
  vi
} from 'vitest';

import { LoginComponent } from './login';
import { AuthService } from '../../../core/services/auth';
import { TranslationService } from '../../../core/services/translation';

describe('LoginComponent', () => {

  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  let authServiceMock: {
    login: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  let translationServiceMock: {
    translate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {

    authServiceMock = {
      login: vi.fn()
    };

    routerMock = {
      navigate: vi.fn()
    };

    translationServiceMock = {
      translate: vi.fn(
        (key: string) => key
      )
    };

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent
      ],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock
        },
        {
          provide: Router,
          useValue: routerMock
        },
        {
          provide: TranslationService,
          useValue: translationServiceMock
        }
      ]
    })
      .overrideComponent(
        LoginComponent,
        {
          set: {
            template: ''
          }
        }
      )
      .compileComponents();

    fixture = TestBed.createComponent(
      LoginComponent
    );

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should login with trimmed email', () => {

    authServiceMock.login.mockReturnValue(
      of({
        token: 'test-token',
        userId: 'user-1',
        fullName: 'Admin User',
        email: 'admin@test.com',
        role: 'Admin'
      })
    );

    component.email = '  admin@test.com  ';
    component.password = 'Password123!';

    component.login();

    expect(
      authServiceMock.login
    ).toHaveBeenCalledWith({
      email: 'admin@test.com',
      password: 'Password123!'
    });
  });

  it('should navigate to patients after successful login', () => {

    authServiceMock.login.mockReturnValue(
      of({
        token: 'test-token',
        userId: 'user-1',
        fullName: 'Admin User',
        email: 'admin@test.com',
        role: 'Admin'
      })
    );

    component.email = 'admin@test.com';
    component.password = 'Password123!';

    component.login();

    expect(
      routerMock.navigate
    ).toHaveBeenCalledWith([
      '/patients'
    ]);

    expect(
      component.isLoading
    ).toBeFalsy();
  });

  it('should prevent multiple login requests while loading', () => {

    component.isLoading = true;

    component.login();

    expect(
      authServiceMock.login
    ).not.toHaveBeenCalled();
  });

  it('should show API error message when login fails', () => {

    authServiceMock.login.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Invalid credentials'
        }
      }))
    );

    component.email = 'admin@test.com';
    component.password = 'wrong-password';

    component.login();

    expect(
      component.isLoading
    ).toBeFalsy();

    expect(
      component.errorMessage
    ).toBe('Invalid credentials');
  });

  it('should use translated fallback message when API message is missing', () => {

    translationServiceMock.translate.mockReturnValue(
      'Invalid email or password'
    );

    authServiceMock.login.mockReturnValue(
      throwError(() => ({
        error: {}
      }))
    );

    component.email = 'admin@test.com';
    component.password = 'wrong-password';

    component.login();

    expect(
      translationServiceMock.translate
    ).toHaveBeenCalledWith(
      'login.invalidCredentials'
    );

    expect(
      component.errorMessage
    ).toBe('Invalid email or password');
  });

  it('should translate a key', () => {

    translationServiceMock.translate.mockReturnValue(
      'Translated text'
    );

    const result = component.t(
      'login.title'
    );

    expect(
      translationServiceMock.translate
    ).toHaveBeenCalledWith(
      'login.title'
    );

    expect(result).toBe(
      'Translated text'
    );
  });

});