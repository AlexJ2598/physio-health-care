import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, catchError, finalize, of, switchMap, takeUntil, throwError } from 'rxjs';

import { ClinicalRecordService } from '../../../core/services/clinical-record.service';
import { TranslationService } from '../../../core/services/translation';
import { ClinicalRecord } from '../../../shared/models/clinical-record.model';

@Component({
  selector: 'app-clinical-record-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clinical-record-detail.html',
  styleUrl: './clinical-record-detail.scss',
})
export class ClinicalRecordDetail implements OnInit, OnDestroy {
  // State and configuration

  patientId = '';
  clinicalRecord: ClinicalRecord | null = null;
  isLoading = false;
  isCreating = false;
  errorMessage = '';
  successMessage = '';

  // Reactive streams

  private readonly destroy$ = new Subject<void>();

  // Dependencies

  constructor(
    private readonly clinicalRecordService: ClinicalRecordService,
    private readonly translationService: TranslationService,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  // Computed values

  get isBusy(): boolean {
    return this.isLoading || this.isCreating;
  }

  // Lifecycle

  ngOnInit(): void {
    this.translationService.language$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.markForCheck();
    });

    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.patientId) {
      this.errorMessage = 'clinicalRecords.invalidPatient';
      return;
    }

    this.loadClinicalRecord();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data loading

  loadClinicalRecord(): void {
    if (!this.patientId || this.isBusy) {
      return;
    }

    this.isLoading = true;
    this.clearMessages();
    this.cdr.markForCheck();

    this.clinicalRecordService
      .getByPatientId(this.patientId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (clinicalRecord) => {
          this.clinicalRecord = clinicalRecord;
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          this.clinicalRecord = null;
          switch (error.status) {
            case 404:
              // No se encontró el expediente.
              // Pendiente distinguir si el paciente existe.
              break;

            case 401:
            case 403:
              this.errorMessage = 'clinicalRecords.accessDenied';
              break;

            case 0:
              this.errorMessage = 'clinicalRecords.connectionError';
              break;

            default:
              this.errorMessage = 'clinicalRecords.loadError';
              break;
          }
          this.cdr.markForCheck();
        },
      });
  }

  // Clinical record actions

  createClinicalRecord(): void {
    if (!this.patientId || this.isBusy) {
      return;
    }

    this.isCreating = true;
    this.clearMessages();
    this.cdr.markForCheck();

    let recoveredExistingRecord = false;

    this.clinicalRecordService
      .create(this.patientId)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status !== 409) {
            return throwError(() => error);
          }

          return this.clinicalRecordService.getByPatientId(this.patientId).pipe(
            switchMap((record) => {
              recoveredExistingRecord = true;
              return of(record);
            }),
            catchError(() => {
              return throwError(() => error);
            }),
          );
        }),
        finalize(() => {
          this.isCreating = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (clinicalRecord) => {
          this.clinicalRecord = clinicalRecord;

          if (!recoveredExistingRecord) {
            this.successMessage = 'clinicalRecords.createSuccess';
          }

          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          switch (error.status) {
            case 409:
              this.errorMessage = 'clinicalRecords.duplicateError';
              break;

            case 401:
            case 403:
              this.errorMessage = 'clinicalRecords.accessDenied';
              break;

            case 0:
              this.errorMessage = 'clinicalRecords.connectionError';
              break;

            default:
              this.errorMessage = 'clinicalRecords.createError';
              break;
          }

          this.cdr.markForCheck();
        },
      });
  }

  goBack(): void {
    void this.router.navigate(['/patients']);
  }

  goToClinicalHistory(): void {
    if (!this.patientId) {
      return;
    }

    this.router.navigate(['/patients', this.patientId, 'clinical-record', 'history']);
  }

  // Template helpers

  t(key: string): string {
    return this.translationService.translate(key);
  }

  dateLocale(): string {
    return this.translationService.getCurrentLanguage() === 'es' ? 'es-MX' : 'en-US';
  }

  // Internal helpers

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
