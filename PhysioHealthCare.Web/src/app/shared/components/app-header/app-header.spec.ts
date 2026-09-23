import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { Router } from '@angular/router';
import {
  BehaviorSubject,
  of
} from 'rxjs';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  AppHeaderComponent
} from './app-header';
import {
  TranslationService
} from '../../../core/services/translation';

describe('AppHeaderComponent', () => {

  let component: AppHeaderComponent;
  let fixture: ComponentFixture<AppHeaderComponent>;

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  let translationServiceMock: {
    language$: BehaviorSubject<'en' | 'es'>;
    translate: ReturnType<typeof vi.fn>;
    setLanguage: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {

    routerMock = {
      navigate: vi.fn()
    };

    translationServiceMock = {
      language$:
        new BehaviorSubject<'en' | 'es'>(
          'en'
        ),

      translate: vi.fn(
        (key: string) => key
      ),

      setLanguage: vi.fn(
        () => of(undefined)
      )
    };

    await TestBed.configureTestingModule({
      imports: [
        AppHeaderComponent
      ],
      providers: [
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
        AppHeaderComponent,
        {
          set: {
            template: ''
          }
        }
      )
      .compileComponents();

    fixture = TestBed.createComponent(
      AppHeaderComponent
    );

    component = fixture.componentInstance;

    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update current language on init', () => {

    component.ngOnInit();

    expect(
      component.currentLanguage
    ).toBe('en');

    translationServiceMock.language$
      .next('es');

    expect(
      component.currentLanguage
    ).toBe('es');
  });

  it('should translate a key', () => {

    translationServiceMock.translate
      .mockReturnValue(
        'Patients'
      );

    const result = component.t(
      'nav.patients'
    );

    expect(
      translationServiceMock.translate
    ).toHaveBeenCalledWith(
      'nav.patients'
    );

    expect(result).toBe(
      'Patients'
    );
  });

  it('should change language', () => {

    component.currentLanguage = 'en';

    component.changeLanguage('es');

    expect(
      translationServiceMock.setLanguage
    ).toHaveBeenCalledWith(
      'es'
    );
  });

  it('should not change language when already selected', () => {

    component.currentLanguage = 'en';

    component.changeLanguage('en');

    expect(
      translationServiceMock.setLanguage
    ).not.toHaveBeenCalled();
  });

  it('should remove token and navigate to login on logout', () => {

    localStorage.setItem(
      'physiohealthcare_token',
      'test-token'
    );

    component.logout();

    expect(
      localStorage.getItem(
        'physiohealthcare_token'
      )
    ).toBeNull();

    expect(
      routerMock.navigate
    ).toHaveBeenCalledWith([
      '/login'
    ]);
  });

});