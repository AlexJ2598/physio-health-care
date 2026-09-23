import {
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { signal } from '@angular/core';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  ToastComponent
} from './toast';
import {
  ToastMessage,
  ToastService
} from '../../../core/services/toast';

describe('ToastComponent', () => {

  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  let toastServiceMock: {
    toasts: ReturnType<typeof signal<ToastMessage[]>>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {

    toastServiceMock = {
      toasts: signal<ToastMessage[]>([]),
      remove: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        ToastComponent
      ],
      providers: [
        {
          provide: ToastService,
          useValue: toastServiceMock
        }
      ]
    })
      .overrideComponent(
        ToastComponent,
        {
          set: {
            template: ''
          }
        }
      )
      .compileComponents();

    fixture = TestBed.createComponent(
      ToastComponent
    );

    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose toasts from ToastService', () => {
    const toast: ToastMessage = {
      id: 1,
      type: 'success',
      message: 'Patient created',
      duration: 3000
    };

    toastServiceMock.toasts.set([
      toast
    ]);

    expect(
      component.toasts()
    ).toEqual([
      toast
    ]);
  });

  it('should remove toast through ToastService', () => {
    const toast: ToastMessage = {
      id: 1,
      type: 'error',
      message: 'Something went wrong',
      duration: 5000
    };

    component.removeToast(toast);

    expect(
      toastServiceMock.remove
    ).toHaveBeenCalledWith(
      toast.id
    );
  });

});