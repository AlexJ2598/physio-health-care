
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { HasPendingChanges, HasUnsavedChanges } from '../../../core/guards/unsaved-changes.guard';
import { AppointmentService } from '../../../core/services/appointment';
import { ToastService } from '../../../core/services/toast';
import { TranslationService } from '../../../core/services/translation';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { UpdateAppointment } from '../../../shared/models/appointment';
import { PreventUnloadDirective } from '../../../shared/directives/prevent-unload.directive';

@Component({
  selector: 'app-appointment-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingComponent,
    PreventUnloadDirective,
  ],
  templateUrl: './appointment-edit.html',
  styleUrl: './appointment-edit.scss',
})
export class AppointmentEditComponent
  implements OnInit, OnDestroy, HasUnsavedChanges, HasPendingChanges {

  // State and configuration

  appointmentId = '';
  patientName = '';
  appointmentDate = '';
  reason = '';
  notes = '';
  isLoading = false;
  isSaving = false;
  loadErrorMessage = '';
  errorMessage = '';
  formSubmitted = false;

  // Original values for unsaved changes detection

  private originalAppointmentDate = '';
  private originalReason = '';
  private originalNotes = '';
  private hasLoadedAppointment = false;

  private readonly destroy$ = new Subject<void>();

  // Dependencies

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly appointmentService: AppointmentService,
    private readonly cdr: ChangeDetectorRef,
    private readonly translationService: TranslationService,
    private readonly toastService: ToastService,
  ) {}

  // Lifecycle

  ngOnInit(): void {
    this.translationService.language$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.detectChanges();
      });

    this.appointmentId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.appointmentId) {
      this.router.navigate(['/not-found']);
      return;
    }

    this.loadAppointment();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data loading

  loadAppointment(): void {
    if (this.isLoading || this.isSaving) {
      return;
    }

    this.isLoading = true;
    this.loadErrorMessage = '';
    this.cdr.detectChanges();

    this.appointmentService
      .getById(this.appointmentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (appointment) => {
          if (appointment.status !== 'Scheduled') {
            this.isLoading = false;

            this.toastService.warning(
              this.t('appointments.edit.notEditable'),
            );

            this.router.navigate([
              '/appointments',
              appointment.id,
            ]);

            return;
          }

          this.patientName = appointment.patientName;

          this.appointmentDate =
            this.toLocalDateTimeInput(
              appointment.appointmentDate,
            );

          this.reason = appointment.reason;
          this.notes = appointment.notes ?? '';

          // Store initial values only after loading succeeds
          this.captureOriginalValues();

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(
            'Load appointment error',
            error,
          );

          this.isLoading = false;

          if (error.status === 404) {
            this.router.navigate(['/not-found']);
            return;
          }

          this.loadErrorMessage =
            this.t('appointments.edit.loadError');

          this.cdr.detectChanges();
        },
      });
  }

  // Form submission

  updateAppointment(): void {
    this.formSubmitted = true;

    if (this.isSaving || this.isLoading) {
      return;
    }

    if (
      !this.appointmentDate ||
      !this.reason.trim()
    ) {
      this.errorMessage =
        this.t('appointments.validation.requiredFields');

      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';
    this.isSaving = true;
    this.cdr.detectChanges();

    const appointment: UpdateAppointment = {
      appointmentDate:
        new Date(this.appointmentDate).toISOString(),

      reason: this.reason.trim(),

      notes: this.notes.trim() || undefined,
    };

    this.appointmentService
      .update(
        this.appointmentId,
        appointment,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;

          // Saved changes must not trigger CanDeactivate
          this.captureOriginalValues();

          this.toastService.success(
            this.t('appointments.edit.success'),
          );

          this.router.navigate([
            '/appointments',
          ]);
        },
        error: (error) => {
          console.error(
            'Update appointment error',
            error,
          );

          this.isSaving = false;

          this.errorMessage =
            this.t('appointments.edit.error');

          this.toastService.error(
            this.errorMessage,
          );

          this.cdr.detectChanges();
        },
      });
  }

  // Unsaved changes protection

  canDeactivate(): boolean {
    // Prevent navigation during an active save
    if (this.isSaving) {
      return false;
    }

    // No changes or no appointment loaded
    if (!this.hasUnsavedChanges()) {
      return true;
    }

    return window.confirm(
      this.t('clinicalHistory.form.discardChanges')
    );
  }

  //prevent refresh
  hasPendingChanges(): boolean {
    return this.hasUnsavedChanges() || this.isSaving;
  }

  private hasUnsavedChanges(): boolean {
    if (!this.hasLoadedAppointment) {
      return false;
    }

    return (
      this.appointmentDate !== this.originalAppointmentDate ||
      this.reason !== this.originalReason ||
      this.notes !== this.originalNotes
    );
  }

  private captureOriginalValues(): void {
    this.originalAppointmentDate = this.appointmentDate;
    this.originalReason = this.reason;
    this.originalNotes = this.notes;
    this.hasLoadedAppointment = true;
  }

  // Template helpers

  cancel(): void {
    if (this.isSaving) {
      return;
    }

    this.router.navigate([
      '/appointments',
    ]);
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }

  // Internal helpers

  private toLocalDateTimeInput(
    utcDate: string,
  ): string {
    const date = new Date(utcDate);

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
      date.getDate(),
    ).padStart(2, '0');

    const hours = String(
      date.getHours(),
    ).padStart(2, '0');

    const minutes = String(
      date.getMinutes(),
    ).padStart(2, '0');

    return (
      `${year}-${month}-${day}` +
      `T${hours}:${minutes}`
    );
  }
}
