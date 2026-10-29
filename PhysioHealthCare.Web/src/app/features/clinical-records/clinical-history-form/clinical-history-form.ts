import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HasPendingChanges, HasUnsavedChanges } from '../../../core/guards/unsaved-changes.guard';
import {
  catchError,
  finalize,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import {
  ClinicalHistory,
  CreateClinicalHistory,
} from '../../../shared/models/clinical-history.model';
import { ClinicalRecordService } from '../../../core/services/clinical-record.service';
import { ClinicalHistoryService } from '../../../core/services/clinical-history.service';
import { PreventUnloadDirective } from '../../../shared/directives/prevent-unload.directive';
import { TranslationService } from '../../../core/services/translation';
import { ToastService } from '../../../core/services/toast';
import { LoadingComponent } from '../../../shared/components/loading/loading';
// ======================================================
// Date helpers
// ======================================================
function localDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
function notFutureDate(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value as string | null;
  if (!value) {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { invalidDate: true };
  }
  const date = new Date(`${value}T12:00:00`);
  if (
    Number.isNaN(date.getTime()) ||
    localDateString(date) !== value
  ) {
    return { invalidDate: true };
  }
  if (value > localDateString(new Date())) {
    return { futureDate: true };
  }
  return null;
}
// ======================================================
// Component
// ======================================================
@Component({
  selector: 'app-clinical-history-form',
  imports: [
    ReactiveFormsModule,
    LoadingComponent,
    PreventUnloadDirective
  ],
  templateUrl: './clinical-history-form.html',
  styleUrl: './clinical-history-form.scss',
})
export class ClinicalHistoryForm implements OnInit, HasUnsavedChanges, HasPendingChanges {

  // ====================================================
  // Dependencies

  // ====================================================
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly clinicalRecordService =
    inject(ClinicalRecordService);
  private readonly clinicalHistoryService =
    inject(ClinicalHistoryService);
  private readonly translationService =
    inject(TranslationService);
  private readonly toastService =
    inject(ToastService);

  // ====================================================
  // Signals

  // ====================================================
  private readonly languageVersion = signal(0);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);
  readonly errorMessage = signal('');
  readonly clinicalRecordId = signal('');
  readonly recordNumber = signal('');
  readonly hasConflict = signal(false);
  readonly hasServerValidationErrors = signal(false);

  // ====================================================
  // General state

  // ====================================================
  readonly maxDate = localDateString(new Date());
  patientId = '';

  // ====================================================
  // Reactive form

  // ====================================================
  readonly form = this.fb.group({
    // Reason for consultation
    chiefComplaint: [
      '',
      [
        Validators.required,
        Validators.maxLength(1000),
      ],
    ],
    currentCondition: [
      '',
      Validators.maxLength(2000),
    ],
    conditionOnsetDate: [
      '',
      notFutureDate,
    ],
    injuryMechanism: [
      '',
      Validators.maxLength(1000),
    ],
    // Medical history
    relevantMedicalHistory: [
      '',
      Validators.maxLength(2000),
    ],
    previousSurgeries: [
      '',
      Validators.maxLength(2000),
    ],
    previousInjuries: [
      '',
      Validators.maxLength(2000),
    ],
    allergies: [
      '',
      Validators.maxLength(1000),
    ],
    currentMedications: [
      '',
      Validators.maxLength(1000),
    ],
    // Medical information
    medicalDiagnosis: [
      '',
      Validators.maxLength(2000),
    ],
    referringPhysician: [
      '',
      Validators.maxLength(200),
    ],
    previousStudies: [
      '',
      Validators.maxLength(2000),
    ],
    // Physical therapy
    painLevel: [
      null as number | null,
      [
        Validators.min(0),
        Validators.max(10),
        Validators.pattern(/^\d+$/),
      ],
    ],
    functionalLimitations: [
      '',
      Validators.maxLength(2000),
    ],
    physicalTherapyAssessment: [
      '',
      Validators.maxLength(4000),
    ],
    physicalTherapyDiagnosis: [
      '',
      Validators.maxLength(2000),
    ],
    // General observations
    notes: [
      '',
      Validators.maxLength(4000),
    ],
  });

  // ====================================================
  // Lifecycle

  // ====================================================
  ngOnInit(): void {
    this.translationService.language$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.languageVersion.update(
          version => version + 1
        );
      });
    const patientId =
      this.route.snapshot.paramMap.get('id');
    if (!patientId) {
      this.errorMessage.set(
        'clinicalRecords.invalidPatient'
      );
      return;
    }
    this.patientId = patientId;
    this.loadClinicalRecord();
  }

  // ====================================================
  // Load clinical record and history

  // ====================================================
  loadClinicalRecord(): void {
    if (
      this.isLoading() ||
      this.isSaving() ||
      !this.patientId
    ) {
      return;
    }
    if (this.form.dirty) {
      const confirmed = window.confirm(
        this.t('clinicalHistory.form.discardChanges')
      );
      if (!confirmed) {
        return;
      }
    }
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.hasConflict.set(false);
    this.hasServerValidationErrors.set(false);
    this.clinicalRecordService
      .getByPatientId(this.patientId)
      .pipe(
        switchMap(record => {
          this.clinicalRecordId.set(record.id);
          this.recordNumber.set(
            record.recordNumber
          );
          return this.clinicalHistoryService
            .getByClinicalRecordId(record.id)
            .pipe(
              catchError(
                (error: HttpErrorResponse) => {
                  if (error.status === 404) {
                    return of(null);
                  }
                  return throwError(() => error);
                }
              )
            );
        }),
        finalize(() => {
          this.isLoading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (history: ClinicalHistory | null) => {
          if (history) {
            this.isEditMode.set(true);
            this.populateForm(history);
          } else {
            this.isEditMode.set(false);
            this.form.reset();
            this.form.markAsPristine();
            this.form.markAsUntouched();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'load');
        },
      });
  }

  // ====================================================
  // Populate form

  // ====================================================
  private populateForm(
    history: ClinicalHistory
  ): void {
    this.form.patchValue({
      chiefComplaint:
        history.chiefComplaint,
      currentCondition:
        history.currentCondition ?? '',
      conditionOnsetDate:
        history.conditionOnsetDate?.slice(0, 10) ?? '',
      injuryMechanism:
        history.injuryMechanism ?? '',
      relevantMedicalHistory:
        history.relevantMedicalHistory ?? '',
      previousSurgeries:
        history.previousSurgeries ?? '',
      previousInjuries:
        history.previousInjuries ?? '',
      allergies:
        history.allergies ?? '',
      currentMedications:
        history.currentMedications ?? '',
      medicalDiagnosis:
        history.medicalDiagnosis ?? '',
      referringPhysician:
        history.referringPhysician ?? '',
      previousStudies:
        history.previousStudies ?? '',
      painLevel:
        history.painLevel,
      functionalLimitations:
        history.functionalLimitations ?? '',
      physicalTherapyAssessment:
        history.physicalTherapyAssessment ?? '',
      physicalTherapyDiagnosis:
        history.physicalTherapyDiagnosis ?? '',
      notes:
        history.notes ?? '',
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  // ====================================================
  // Save clinical history

  // ====================================================
  save(): void {
    if (
      this.isLoading() ||
      this.isSaving() ||
      !this.clinicalRecordId() ||
      this.errorMessage()
    ) {
      return;
    }
    this.hasServerValidationErrors.set(false);
    this.clearServerErrors();
    this.form.updateValueAndValidity();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.warning(
        this.t(
          'clinicalHistory.form.validationError'
        )
      );
      return;
    }
    const values = this.form.getRawValue();
    const normalize = (
      value: string | null
    ): string | null => {
      const trimmed = value?.trim() ?? '';
      return trimmed.length > 0
        ? trimmed
        : null;
    };
    const chiefComplaint =
      values.chiefComplaint?.trim() ?? '';
    if (!chiefComplaint) {
      this.form.controls.chiefComplaint.setErrors({
        required: true,
      });
      this.form.controls.chiefComplaint.markAsTouched();
      this.toastService.warning(
        this.t(
          'clinicalHistory.form.validationError'
        )
      );
      return;
    }
    const dto: CreateClinicalHistory = {
      chiefComplaint,
      currentCondition:
        normalize(values.currentCondition),
      conditionOnsetDate:
        values.conditionOnsetDate || null,
      injuryMechanism:
        normalize(values.injuryMechanism),
      relevantMedicalHistory:
        normalize(values.relevantMedicalHistory),
      previousSurgeries:
        normalize(values.previousSurgeries),
      previousInjuries:
        normalize(values.previousInjuries),
      allergies:
        normalize(values.allergies),
      currentMedications:
        normalize(values.currentMedications),
      medicalDiagnosis:
        normalize(values.medicalDiagnosis),
      referringPhysician:
        normalize(values.referringPhysician),
      previousStudies:
        normalize(values.previousStudies),
      painLevel:
        values.painLevel,
      functionalLimitations:
        normalize(values.functionalLimitations),
      physicalTherapyAssessment:
        normalize(values.physicalTherapyAssessment),
      physicalTherapyDiagnosis:
        normalize(values.physicalTherapyDiagnosis),
      notes:
        normalize(values.notes),
    };
    this.isSaving.set(true);
    this.errorMessage.set('');
    this.hasConflict.set(false);
    const editing = this.isEditMode();
    const request$ = editing
      ? this.clinicalHistoryService.update(
          this.clinicalRecordId(),
          dto
        )
      : this.clinicalHistoryService.create(
          this.clinicalRecordId(),
          dto
        );
    request$
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.form.markAsPristine();
          this.toastService.success(
            this.t(
              editing
                ? 'clinicalHistory.form.updateSuccess'
                : 'clinicalHistory.form.createSuccess'
            )
          );
          this.router.navigate([
            '/patients',
            this.patientId,
            'clinical-record',
            'history',
          ]);
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error, 'save');
        },
      });
  }

  // ====================================================
  // Handle backend validation errors

  // ====================================================
  private applyServerValidationErrors(
    error: HttpErrorResponse
  ): boolean {
    const response = error.error;
    if (
      !response ||
      typeof response !== 'object' ||
      !('errors' in response)
    ) {
      return false;
    }
    const errors = response.errors;
    if (
      !errors ||
      typeof errors !== 'object'
    ) {
      return false;
    }
    let applied = false;
    for (const [field, messages] of Object.entries(errors)) {
      const controlName =
        field.charAt(0).toLowerCase() +
        field.slice(1);
      const control = this.form.get(controlName);
      if (!control) {
        continue;
      }
      const message = Array.isArray(messages)
        ? messages.join(' ')
        : String(messages);
      control.setErrors({
        ...(control.errors ?? {}),
        server: message,
      });
      control.markAsTouched();
      applied = true;
    }
    if (applied) {
      this.hasServerValidationErrors.set(true);
    }
    return applied;
  }
  private clearServerErrors(): void {
    for (const control of Object.values(
      this.form.controls
    )) {
      if (!control.hasError('server')) {
        continue;
      }
      const errors = {
        ...(control.errors ?? {}),
      };
      delete errors['server'];
      control.setErrors(
        Object.keys(errors).length > 0
          ? errors
          : null
      );
    }
  }
  serverError(controlName: string): string {
    const control = this.form.get(controlName);
    return control?.getError('server') ?? '';
  }

  // ====================================================
  // Navigation

  // ====================================================
  /** Prevent navigation while saving and confirm unsaved changes. */
  canDeactivate(): boolean {
    if (this.isSaving()) {
      return false;
    }
    if (!this.form.dirty) {
      return true;
    }
    return window.confirm(
      this.t('clinicalHistory.form.discardChanges')
    );
  }

  hasPendingChanges(): boolean {
    return this.form.dirty || this.isSaving();
  }
  /** Navigate back; the route guard handles confirmation. */
  cancel(): void {
    if (this.isSaving()) {
      return;
    }
    this.router.navigate([
      '/patients',
      this.patientId,
      'clinical-record',
      'history',
    ]);
  }

  // ====================================================
  // Validation helpers

  // ====================================================
  hasError(
    controlName: string,
    errorName: string
  ): boolean {
    const control = this.form.get(controlName);
    return !!(
      control &&
      (control.touched || control.dirty) &&
      control.hasError(errorName)
    );
  }

  // ====================================================
  // Error handling

  // ====================================================
  private handleError(
    error: HttpErrorResponse,
    operation: 'load' | 'save'
  ): void {
    let messageKey: string;
    switch (error.status) {
      case 400:
        if (
          operation === 'save' &&
          this.applyServerValidationErrors(error)
        ) {
          this.toastService.warning(
            this.t(
              'clinicalHistory.form.validationError'
            )
          );
          return;
        }
        messageKey =
          'clinicalHistory.form.saveError';
        break;
      case 401:
      case 403:
        messageKey =
          'clinicalRecords.accessDenied';
        break;
      case 404:
        messageKey =
          operation === 'load'
            ? 'clinicalHistory.form.recordNotFound'
            : 'clinicalHistory.form.notFound';
        break;
      case 409:
        this.hasConflict.set(true);
        messageKey =
          'clinicalHistory.form.conflictError';
        break;
      case 0:
        messageKey =
          'clinicalRecords.connectionError';
        break;
      default:
        messageKey =
          operation === 'load'
            ? 'clinicalHistory.detail.loadError'
            : 'clinicalHistory.form.saveError';
        break;
    }
    if (operation === 'load') {
      this.errorMessage.set(messageKey);
    }
    this.toastService.error(
      this.t(messageKey)
    );
  }

  // ====================================================
  // Translations

  // ====================================================
  t(key: string): string {
    this.languageVersion();
    return this.translationService.translate(key);
  }
}
