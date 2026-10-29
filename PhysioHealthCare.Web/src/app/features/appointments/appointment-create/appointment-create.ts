
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { HasPendingChanges, HasUnsavedChanges } from '../../../core/guards/unsaved-changes.guard';
import { AppointmentService } from '../../../core/services/appointment';
import { PatientService } from '../../../core/services/patient';
import { ToastService } from '../../../core/services/toast';
import { TranslationService } from '../../../core/services/translation';
import { CreateAppointment } from '../../../shared/models/appointment';
import { Patient } from '../../../shared/models/patient';
import { PreventUnloadDirective } from '../../../shared/directives/prevent-unload.directive';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PreventUnloadDirective,
  ],
  templateUrl: './appointment-create.html',
  styleUrl: './appointment-create.scss',
})
export class AppointmentCreateComponent
  implements OnInit, OnDestroy, HasUnsavedChanges, HasPendingChanges {

  // ====================================================
  // State and configuration
  // ====================================================

  patients: Patient[] = [];

  patientId = '';
  appointmentDate = '';
  reason = '';
  notes = '';

  isLoadingPatients = false;
  isSaving = false;

  errorMessage = '';

  private readonly destroy$ = new Subject<void>();

  // ====================================================
  // Initial form values
  // ====================================================

  private originalPatientId = '';
  private originalAppointmentDate = '';
  private originalReason = '';
  private originalNotes = '';

  // ====================================================
  // Dependencies
  // ====================================================

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly patientService: PatientService,
    private readonly toastService: ToastService,
    private readonly translationService: TranslationService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  // ====================================================
  // Lifecycle
  // ====================================================

  ngOnInit(): void {
    this.translationService.language$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.detectChanges();
      });

    this.captureOriginalValues();

    this.loadPatients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ====================================================
  // Data loading
  // ====================================================

  loadPatients(): void {
    if (this.isLoadingPatients) {
      return;
    }

    this.isLoadingPatients = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.patientService
      .getAll(1, 100, undefined, 'fullName', 'asc')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.patients = result.items;
          this.isLoadingPatients = false;

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(
            'Load patients error',
            error,
          );

          this.patients = [];
          this.isLoadingPatients = false;

          this.errorMessage = this.t(
            'appointments.create.loadPatientsError',
          );

          this.cdr.detectChanges();
        },
      });
  }

  // ====================================================
  // Form submission
  // ====================================================

  createAppointment(): void {
    if (this.isSaving || this.isLoadingPatients) {
      return;
    }

    if (!this.isFormValid()) {
      this.toastService.error(
        this.t('appointments.validation.requiredFields'),
      );

      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.cdr.detectChanges();

    const appointment: CreateAppointment = {
      patientId: this.patientId,

      appointmentDate: new Date(
        this.appointmentDate,
      ).toISOString(),

      reason: this.reason.trim(),

      notes: this.notes.trim() || undefined,
    };

    this.appointmentService
      .create(appointment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;

          // The appointment was saved successfully.
          // Update the baseline to avoid a false warning.
          this.captureOriginalValues();

          this.toastService.success(
            this.t('appointments.create.success'),
          );

          this.router.navigate(['/appointments']);
        },
        error: (error) => {
          console.error(
            'Create appointment error',
            error,
          );

          this.isSaving = false;

          this.errorMessage = this.t(
            'appointments.create.error',
          );

          this.toastService.error(
            this.errorMessage,
          );

          this.cdr.detectChanges();
        },
      });
  }

  // ====================================================
  // Unsaved changes protection
  // ====================================================

  canDeactivate(): boolean {
    // Prevent navigation while saving
    if (this.isSaving) {
      return false;
    }

    // Allow navigation when nothing has changed
    if (!this.hasUnsavedChanges()) {
      return true;
    }
    
    // Ask before discarding unsaved information
    return window.confirm(
      this.t('clinicalHistory.form.discardChanges'),
    );
  }

  hasPendingChanges(): boolean {
    return this.hasUnsavedChanges() || this.isSaving;
  }

  private hasUnsavedChanges(): boolean {
    return (
      this.patientId !== this.originalPatientId ||
      this.appointmentDate !== this.originalAppointmentDate ||
      this.reason !== this.originalReason ||
      this.notes !== this.originalNotes
    );
  }

  private captureOriginalValues(): void {
    this.originalPatientId = this.patientId;
    this.originalAppointmentDate = this.appointmentDate;
    this.originalReason = this.reason;
    this.originalNotes = this.notes;
  }

  // ====================================================
  // Template helpers
  // ====================================================

  cancel(): void {
    if (this.isSaving) {
      return;
    }

    // CanDeactivate handles the confirmation.
    this.router.navigate(['/appointments']);
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }

  // ====================================================
  // Internal helpers
  // ====================================================

  private isFormValid(): boolean {
    return Boolean(
      this.patientId &&
      this.appointmentDate &&
      this.reason.trim()
    );
  }
}
