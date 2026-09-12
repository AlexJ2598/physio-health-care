import {
  ChangeDetectionStrategy,
  Component,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ToastMessage,
  ToastService
} from '../../../core/services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
  changeDetection:
    ChangeDetectionStrategy.OnPush
})
export class ToastComponent {

  private readonly toastService =
    inject(ToastService);

  readonly toasts =
    this.toastService.toasts;

  removeToast(
    toast: ToastMessage
  ): void {
    this.toastService.remove(toast.id);
  }
}