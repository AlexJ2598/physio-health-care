import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { AppointmentService } from '../../../core/services/appointment';
import { ToastService } from '../../../core/services/toast';
import { TranslationService } from '../../../core/services/translation';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { Appointment, AppointmentStatusValue } from '../../../shared/models/appointment';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './appointment-detail.html',
  styleUrl: './appointment-detail.scss',
})
export class AppointmentDetail implements OnInit, OnDestroy {
  // View state

  appointment: Appointment | null = null;

  isLoading = false;
  isUpdatingStatus = false;
  showCancelConfirmation = false;
  showCompleteConfirmation = false;
  errorMessage = '';

  // Subscription lifecycle

  private readonly destroy$ = new Subject<void>();

  // Dependencies

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly appointmentService: AppointmentService,
    private readonly translationService: TranslationService,
    private readonly toastService: ToastService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  // Component lifecycle

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/not-found']);
      return;
    }

    this.loadAppointment(id);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Appointment loading

  loadAppointment(id: string): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.changeDetector.detectChanges();

    this.appointmentService
      .getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointment) => {
          this.appointment = appointment;
          this.isLoading = false;

          this.changeDetector.detectChanges();
        },
        error: (error) => {
          console.error('Error loading appointment:', error);

          this.appointment = null;
          this.isLoading = false;

          this.errorMessage = this.t('appointments.detail.loadError');

          this.toastService.error(this.errorMessage);

          this.changeDetector.detectChanges();
        },
      });
  }

  // Start appointment

  startAppointment(): void {
    this.updateAppointmentStatus(2, 'appointments.detail.startSuccess');
  }

  // Completion confirmation

  completeAppointment(): void {
    if (!this.appointment || this.isUpdatingStatus) {
      return;
    }

    this.showCompleteConfirmation = true;
    this.changeDetector.detectChanges();
  }

  closeCompleteConfirmation(): void {
    if (this.isUpdatingStatus) {
      return;
    }
    this.showCompleteConfirmation = false;
    this.changeDetector.detectChanges();
  }

  confirmCompleteAppointment(): void {
    if (!this.appointment || this.isUpdatingStatus) {
      return;
    }

    this.showCompleteConfirmation = false;
    this.updateAppointmentStatus(3, 'appointments.detail.completeSuccess');
  }

  // Cancellation confirmation

  cancelAppointment(): void {
    if (!this.appointment || this.isUpdatingStatus) {
      return;
    }

    this.showCancelConfirmation = true;
    this.changeDetector.detectChanges();
  }

  closeCancelConfirmation(): void {
    if (this.isUpdatingStatus) {
      return;
    }

    this.showCancelConfirmation = false;
    this.changeDetector.detectChanges();
  }

  confirmCancelAppointment(): void {
    if (!this.appointment || this.isUpdatingStatus) {
      return;
    }
    this.showCancelConfirmation = false;
    this.updateAppointmentStatus(4, 'appointments.detail.cancelSuccess');
  }

  // Translation and display helpers

  t(key: string): string {
    return this.translationService.translate(key);
  }

  dateLocale(): string {
    return this.translationService.getCurrentLanguage() === 'es' ? 'es-MX' : 'en-US';
  }

  statusTranslationKey(status: Appointment['status']): string {
    switch (status) {
      case 'Scheduled':
        return 'scheduled';

      case 'InProgress':
        return 'inProgress';

      case 'Completed':
        return 'completed';

      case 'Cancelled':
        return 'cancelled';
    }
  }

  // Status update request

  private updateAppointmentStatus(status: AppointmentStatusValue, successMessageKey: string): void {
    if (!this.appointment || this.isUpdatingStatus) {
      return;
    }

    this.isUpdatingStatus = true;
    this.changeDetector.detectChanges();

    this.appointmentService
      .updateStatus(this.appointment.id, { status })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointment) => {
          this.appointment = appointment;
          this.isUpdatingStatus = false;

          this.toastService.success(this.t(successMessageKey));

          this.changeDetector.detectChanges();
        },
        error: (error) => {
          console.error('Error updating appointment status:', error);

          this.isUpdatingStatus = false;

          this.toastService.error(this.t('appointments.detail.statusUpdateError'));

          this.changeDetector.detectChanges();
        },
      });
  }
}
