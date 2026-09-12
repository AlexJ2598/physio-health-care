import { Injectable, signal } from '@angular/core';

export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private nextId = 1;

  readonly toasts = signal<ToastMessage[]>([]);

  success(
    message: string,
    duration = 3000
  ): void {
    this.show(
      'success',
      message,
      duration
    );
  }

  error(
    message: string,
    duration = 5000
  ): void {
    this.show(
      'error',
      message,
      duration
    );
  }

  warning(
    message: string,
    duration = 4000
  ): void {
    this.show(
      'warning',
      message,
      duration
    );
  }

  info(
    message: string,
    duration = 3000
  ): void {
    this.show(
      'info',
      message,
      duration
    );
  }

  remove(id: number): void {
    this.toasts.update(toasts =>
      toasts.filter(toast => toast.id !== id)
    );
  }

  private show(
    type: ToastType,
    message: string,
    duration: number
  ): void {

    const toast: ToastMessage = {
      id: this.nextId++,
      type,
      message,
      duration
    };

    this.toasts.update(toasts => [
      ...toasts,
      toast
    ]);

    setTimeout(() => {
      this.remove(toast.id);
    }, duration);
  }
}