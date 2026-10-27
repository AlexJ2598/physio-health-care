
import {
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';

import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  catchError,
  finalize,
  of,
  switchMap,
  throwError,
} from 'rxjs';

import { ClinicalRecord } from '../../../shared/models/clinical-record.model';
import { ClinicalHistory } from '../../../shared/models/clinical-history.model';

import { ClinicalRecordService } from '../../../core/services/clinical-record.service';
import { ClinicalHistoryService } from '../../../core/services/clinical-history.service';
import { TranslationService } from '../../../core/services/translation';

import { LoadingComponent } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-clinical-history-detail',
  imports: [
    DatePipe,
    LoadingComponent,
  ],
  templateUrl: './clinical-history-detail.html',
  styleUrl: './clinical-history-detail.scss',
})
export class ClinicalHistoryDetail implements OnInit {

  // ======================================================
  // Dependencies
  // ======================================================

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly clinicalRecordService = inject(ClinicalRecordService);
  private readonly clinicalHistoryService = inject(ClinicalHistoryService);
  private readonly translationService = inject(TranslationService);

  private readonly destroyRef = inject(DestroyRef);

  // ======================================================
  // Translation reactivity
  // ======================================================

  private readonly languageVersion = signal(0);

  // ======================================================
  // Clinical data
  // ======================================================

  readonly clinicalRecord = signal<ClinicalRecord | null>(null);
  readonly clinicalHistory = signal<ClinicalHistory | null>(null);

  // ======================================================
  // UI state
  // ======================================================

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly hasNoClinicalRecord = signal(false);
  readonly hasNoClinicalHistory = signal(false);

  patientId = '';

  // ======================================================
  // Lifecycle
  // ======================================================

  ngOnInit(): void {

    this.translationService.language$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.languageVersion.update(version => version + 1);
      });

    const patientId = this.route.snapshot.paramMap.get('id');

    if (!patientId) {
      this.errorMessage.set('clinicalRecords.invalidPatient');
      return;
    }

    this.patientId = patientId;

    this.loadClinicalHistory();
  }

  // ======================================================
  // Load clinical record and history
  // ======================================================

  loadClinicalHistory(): void {

    if (!this.patientId || this.isLoading()) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.clinicalRecord.set(null);
    this.clinicalHistory.set(null);

    this.hasNoClinicalRecord.set(false);
    this.hasNoClinicalHistory.set(false);

    this.clinicalRecordService
      .getByPatientId(this.patientId)
      .pipe(

        // Clinical record not found
        catchError((error: HttpErrorResponse) => {

          if (error.status === 404) {
            this.hasNoClinicalRecord.set(true);
            return of(null);
          }

          return throwError(() => error);
        }),

        // Load clinical history
        switchMap((record: ClinicalRecord | null) => {

          if (!record) {
            return of(null);
          }

          this.clinicalRecord.set(record);

          return this.clinicalHistoryService
            .getByClinicalRecordId(record.id)
            .pipe(

              // Clinical history not found
              catchError((error: HttpErrorResponse) => {

                if (error.status === 404) {
                  this.hasNoClinicalHistory.set(true);
                  return of(null);
                }

                return throwError(() => error);
              })
            );
        }),

        // Stop loading on completion or error
        finalize(() => {
          this.isLoading.set(false);
        }),

        // Automatically unsubscribe
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({

        next: (history: ClinicalHistory | null) => {
          this.clinicalHistory.set(history);
        },

        error: (error: HttpErrorResponse) => {

          console.error(
            'Load clinical history error:',
            error
          );

          switch (error.status) {

            case 401:
            case 403:
              this.errorMessage.set(
                'clinicalRecords.accessDenied'
              );
              break;

            case 0:
              this.errorMessage.set(
                'clinicalRecords.connectionError'
              );
              break;

            default:
              this.errorMessage.set(
                'clinicalHistory.detail.loadError'
              );
              break;
          }
        },
      });
  }

  // ======================================================
  // Return to clinical record
  // ======================================================

  goBack(): void {

    if (this.patientId) {
      this.router.navigate([
        '/patients',
        this.patientId,
        'clinical-record',
      ]);

      return;
    }

    this.router.navigate(['/patients']);
  }

  // ======================================================
  // Navigate to create/edit clinical history
  // ======================================================

  goToHistoryForm(): void {

    if (!this.patientId || !this.clinicalRecord()) {
      return;
    }

    this.router.navigate([
      '/patients',
      this.patientId,
      'clinical-record',
      'history',
      'form',
    ]);
  }

  // ======================================================
  // Translation helper
  // ======================================================

  t(key: string): string {

    this.languageVersion();

    return this.translationService.translate(key);
  }

  // ======================================================
  // Date locale
  // ======================================================

  dateLocale(): string {

    this.languageVersion();

    return this.translationService.getCurrentLanguage() === 'es'
      ? 'es-MX'
      : 'en-US';
  }
}
