
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
import { catchError, finalize, of, switchMap, throwError } from 'rxjs';

import { ClinicalRecord } from '../../../shared/models/clinical-record.model';
import { ClinicalHistory } from '../../../shared/models/clinical-history.model';

import { ClinicalRecordService } from '../../../core/services/clinical-record.service';
import { ClinicalHistoryService } from '../../../core/services/clinical-history.service';
import { TranslationService } from '../../../core/services/translation';

@Component({
  selector: 'app-clinical-history-detail',
  imports: [DatePipe],
  templateUrl: './clinical-history-detail.html',
  styleUrl: './clinical-history-detail.scss',
})
export class ClinicalHistoryDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clinicalRecordService = inject(ClinicalRecordService);
  private readonly clinicalHistoryService = inject(ClinicalHistoryService);
  private readonly translationService = inject(TranslationService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly languageVersion = signal(0);

  readonly clinicalRecord = signal<ClinicalRecord | null>(null);
  readonly clinicalHistory = signal<ClinicalHistory | null>(null);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  readonly hasNoClinicalRecord = signal(false);
  readonly hasNoClinicalHistory = signal(false);

  patientId = '';

  ngOnInit(): void {
    this.translationService.language$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.languageVersion.update((version) => version + 1);
      });

    const patientId = this.route.snapshot.paramMap.get('id');

    if (!patientId) {
      this.errorMessage.set('clinicalRecords.invalidPatient');
      return;
    }

    this.patientId = patientId;
    this.loadClinicalHistory();
  }

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
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.hasNoClinicalRecord.set(true);
            return of(null);
          }

          return throwError(() => error);
        }),

        switchMap((record: ClinicalRecord | null) => {
          if (!record) {
            return of(null);
          }

          this.clinicalRecord.set(record);

          return this.clinicalHistoryService
            .getByClinicalRecordId(record.id)
            .pipe(
              catchError((error: HttpErrorResponse) => {
                if (error.status === 404) {
                  this.hasNoClinicalHistory.set(true);
                  return of(null);
                }

                return throwError(() => error);
              })
            );
        }),

        finalize(() => {
          this.isLoading.set(false);
        }),

        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (history: ClinicalHistory | null) => {
          this.clinicalHistory.set(history);
        },

        error: (error: HttpErrorResponse) => {
          console.error('Load clinical history error:', error);

          this.errorMessage.set(
            'clinicalHistory.detail.loadError'
          );
        },
      });
  }

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

  t(key: string): string {
    this.languageVersion();

    return this.translationService.translate(key);
  }

  dateLocale(): string {
    this.languageVersion();

    return this.translationService.getCurrentLanguage() === 'es'
      ? 'es-MX'
      : 'en-US';
  }
}
