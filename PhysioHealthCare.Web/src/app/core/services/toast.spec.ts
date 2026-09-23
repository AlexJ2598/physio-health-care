import { TestBed } from '@angular/core/testing';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from 'vitest';

import {
  ToastService
} from './toast';

describe('ToastService', () => {

  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [
        ToastService
      ]
    });

    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a success toast', () => {
    service.success('Patient created');

    const toasts = service.toasts();

    expect(toasts.length).toBe(1);
    expect(toasts[0].id).toBe(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe(
      'Patient created'
    );
    expect(toasts[0].duration).toBe(3000);
  });

  it('should add an error toast', () => {
    service.error('Something went wrong');

    const toasts = service.toasts();

    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('error');
    expect(toasts[0].message).toBe(
      'Something went wrong'
    );
    expect(toasts[0].duration).toBe(5000);
  });

  it('should add a warning toast', () => {
    service.warning('Warning message');

    const toasts = service.toasts();

    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('warning');
    expect(toasts[0].message).toBe(
      'Warning message'
    );
    expect(toasts[0].duration).toBe(4000);
  });

  it('should add an info toast', () => {
    service.info('Information message');

    const toasts = service.toasts();

    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('info');
    expect(toasts[0].message).toBe(
      'Information message'
    );
    expect(toasts[0].duration).toBe(3000);
  });

  it('should use a custom duration', () => {
    service.success(
      'Custom duration',
      1000
    );

    expect(
      service.toasts()[0].duration
    ).toBe(1000);
  });

  it('should increment toast ids', () => {
    service.success('First');
    service.info('Second');
    service.warning('Third');

    const toasts = service.toasts();

    expect(toasts.length).toBe(3);
    expect(toasts[0].id).toBe(1);
    expect(toasts[1].id).toBe(2);
    expect(toasts[2].id).toBe(3);
  });

  it('should remove a toast by id', () => {
    service.success('First');
    service.error('Second');

    const firstToastId =
      service.toasts()[0].id;

    service.remove(firstToastId);

    const toasts = service.toasts();

    expect(toasts.length).toBe(1);
    expect(toasts[0].message).toBe(
      'Second'
    );
  });

  it('should automatically remove a toast after its duration', () => {
    service.success(
      'Temporary toast',
      1000
    );

    expect(
      service.toasts().length
    ).toBe(1);

    vi.advanceTimersByTime(999);

    expect(
      service.toasts().length
    ).toBe(1);

    vi.advanceTimersByTime(1);

    expect(
      service.toasts().length
    ).toBe(0);
  });

});