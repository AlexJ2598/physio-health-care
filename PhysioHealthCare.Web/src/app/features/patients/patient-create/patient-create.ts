
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { HasUnsavedChanges } from '../../../core/guards/unsaved-changes.guard';
import { PatientService } from '../../../core/services/patient';
import { ToastService } from '../../../core/services/toast';
import { TranslationService } from '../../../core/services/translation';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import {
  CreatePatient,
  PatientGenderValue,
} from '../../../shared/models/patient';

@Component({
  selector: 'app-patient-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LoadingComponent,
  ],
  templateUrl: './patient-create.html',
  styleUrl: './patient-create.scss',
})
export class PatientCreateComponent
  implements OnInit, OnDestroy, HasUnsavedChanges {

  // State and configuration

  isLoading = false;
  errorMessage = '';
  formSubmitted = false;

  patient: CreatePatient = {
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 1,
    phoneNumber: '',
    email: '',
    address: '',
    notes: '',
  };

  // Original form values

  private originalPatient: CreatePatient = {
    ...this.patient,
  };

  private readonly destroy$ = new Subject<void>();

  // Dependencies

  constructor(
    private readonly patientService: PatientService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly translationService: TranslationService,
    private readonly toastService: ToastService,
  ) {}

  // Computed values

  get maxBirthDate(): string {
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    const year = yesterday.getFullYear();

    const month = String(
      yesterday.getMonth() + 1,
    ).padStart(2, '0');

    const day = String(
      yesterday.getDate(),
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // Lifecycle

  ngOnInit(): void {
    this.translationService.language$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Form submission

  createPatient(): void {
    this.formSubmitted = true;

    if (this.isLoading) {
      return;
    }

    if (
      !this.patient.firstName.trim() ||
      !this.patient.lastName.trim() ||
      !this.patient.birthDate ||
      !this.isValidGender(this.patient.gender)
    ) {
      this.errorMessage = this.t(
        'patients.validation.requiredFields',
      );

      this.cdr.detectChanges();
      return;
    }

    if (!this.isBirthDateValid(this.patient.birthDate)) {
      this.errorMessage = this.t(
        'patients.validation.birthDatePast',
      );

      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.cdr.detectChanges();

    this.patientService
      .create(this.patient)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;

          // The patient was saved successfully.
          // Update the baseline before navigating.
          this.captureOriginalValues();

          this.toastService.success(
            this.t('patients.create.success'),
          );

          this.router.navigate(['/patients']);
        },

        error: (error) => {
          console.error('Create patient error', error);

          this.isLoading = false;

          this.errorMessage =
            error.error?.message ||
            error.error?.Message ||
            this.t('patients.create.error');

          this.cdr.detectChanges();
        },
      });
  }

  // Unsaved changes protection

  canDeactivate(): boolean {
    // Prevent navigation while saving
    if (this.isLoading) {
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

  private hasUnsavedChanges(): boolean {
    return (
      this.patient.firstName !== this.originalPatient.firstName ||
      this.patient.lastName !== this.originalPatient.lastName ||
      this.patient.birthDate !== this.originalPatient.birthDate ||
      this.patient.gender !== this.originalPatient.gender ||
      this.patient.phoneNumber !== this.originalPatient.phoneNumber ||
      this.patient.email !== this.originalPatient.email ||
      this.patient.address !== this.originalPatient.address ||
      this.patient.notes !== this.originalPatient.notes
    );
  }

  private captureOriginalValues(): void {
    this.originalPatient = {
      ...this.patient,
    };
  }

  // Template helpers

  t(key: string): string {
    return this.translationService.translate(key);
  }

  // Internal helpers

  private isBirthDateValid(birthDateValue: string): boolean {
    const parts = birthDateValue
      .split('-')
      .map(Number);

    if (parts.length !== 3) {
      return false;
    }

    const [year, month, day] = parts;

    if (!year || !month || !day) {
      return false;
    }

    const birthDate = new Date(
      year,
      month - 1,
      day,
    );

    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    return birthDate < today;
  }

  private isValidGender(
    gender: PatientGenderValue,
  ): boolean {
    return gender >= 1 && gender <= 3;
  }
}
