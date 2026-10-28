
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { HasUnsavedChanges } from '../../../core/guards/unsaved-changes.guard';
import { PatientService } from '../../../core/services/patient';
import { ToastService } from '../../../core/services/toast';
import { TranslationService } from '../../../core/services/translation';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import {
  PatientGenderValue,
  UpdatePatient,
} from '../../../shared/models/patient';

@Component({
  selector: 'app-patient-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LoadingComponent,
  ],
  templateUrl: './patient-edit.html',
  styleUrl: './patient-edit.scss',
})
export class PatientEditComponent
  implements OnInit, OnDestroy, HasUnsavedChanges {

  // State and configuration

  patientId = '';
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  formSubmitted = false;

  patient: UpdatePatient = {
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 1,
    phoneNumber: '',
    email: '',
    address: '',
    notes: '',
  };

  // Original patient values

  private originalPatient: UpdatePatient | null = null;

  private readonly destroy$ = new Subject<void>();

  // Dependencies

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly patientService: PatientService,
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

    this.patientId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.patientId) {
      this.router.navigate(['/not-found']);
      return;
    }

    this.loadPatient();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data loading

  loadPatient(): void {
    if (this.isLoading || this.isSaving) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.patientService
      .getById(this.patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (patient) => {
          this.patient = {
            firstName: patient.firstName,
            lastName: patient.lastName,
            birthDate: patient.birthDate.substring(0, 10),
            gender: patient.gender,
            phoneNumber: patient.phoneNumber ?? '',
            email: patient.email ?? '',
            address: patient.address ?? '',
            notes: patient.notes ?? '',
          };

          // Capture values after loading the patient
          this.captureOriginalValues();

          this.isLoading = false;
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Load patient error', error);

          this.isLoading = false;

          if (error.status === 404) {
            this.router.navigate(['/not-found']);
            return;
          }

          this.errorMessage = this.t(
            'patients.edit.loadError',
          );

          this.cdr.detectChanges();
        },
      });
  }

  // Form submission

  updatePatient(): void {
    this.formSubmitted = true;

    if (this.isSaving || this.isLoading) {
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
    this.isSaving = true;
    this.cdr.detectChanges();

    this.patientService
      .update(this.patientId, this.patient)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;

          // The changes were saved successfully.
          // Update the baseline before navigating.
          this.captureOriginalValues();

          this.toastService.success(
            this.t('patients.edit.success'),
          );

          this.router.navigate(['/patients']);
        },

        error: (error) => {
          console.error('Update patient error', error);

          this.isSaving = false;

          this.errorMessage =
            error.error?.message ||
            error.error?.Message ||
            this.t('patients.edit.error');

          this.cdr.detectChanges();
        },
      });
  }

  // Unsaved changes protection

  canDeactivate(): boolean {
    // Prevent navigation while saving
    if (this.isSaving) {
      return false;
    }

    // Allow navigation when nothing has changed
    if (!this.hasUnsavedChanges()) {
      return true;
    }

    // Confirm before discarding changes
    return window.confirm(
      this.t('clinicalHistory.form.discardChanges'),
    );
  }

  private hasUnsavedChanges(): boolean {
    if (!this.originalPatient) {
      return false;
    }

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
