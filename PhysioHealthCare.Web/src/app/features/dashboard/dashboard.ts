import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { DashboardService } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast';
import { TranslationService } from '../../core/services/translation';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { DashboardSummary } from '../../shared/models/dashboard-summary.model';
import { HISTORY_METRICS, TODAY_METRICS } from './dashboard-metrics';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, RouterLink, LoadingComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, OnDestroy {
  readonly todayMetrics = TODAY_METRICS;
  readonly historyMetrics = HISTORY_METRICS;

  summary: DashboardSummary | null = null;

  isLoading = false;
  errorMessage = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly translationService: TranslationService,
    private readonly toastService: ToastService,
    private readonly changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    if (this.isLoading) {
      return;
    }

    this.errorMessage = '';
    this.updateLoadingState(true);

    this.dashboardService
      .getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => this.handleLoadSuccess(summary),
        error: (error: unknown) => this.handleLoadError(error),
      });
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }

  dateLocale(): string {
    return this.translationService.getCurrentLanguage() === 'es' ? 'es-MX' : 'en-US';
  }

  private handleLoadSuccess(summary: DashboardSummary): void {
    this.summary = summary;
    this.updateLoadingState(false);
  }

  private handleLoadError(error: unknown): void {
    console.error('Error loading dashboard:', error);

    this.summary = null;
    this.errorMessage = this.t('dashboard.loadError');
    this.toastService.error(this.errorMessage);
    this.updateLoadingState(false);
  }

  private updateLoadingState(isLoading: boolean): void {
    this.isLoading = isLoading;
    this.changeDetector.detectChanges();
  }
}
