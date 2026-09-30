import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

import { DashboardService } from '../../core/services/dashboard.service';
import { ToastService } from '../../core/services/toast';
import { TranslationService } from '../../core/services/translation';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { DashboardSummary } from '../../shared/models/dashboard-summary.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {

  summary: DashboardSummary | null = null;

  isLoading = false;
  errorMessage = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly translationService: TranslationService,
    private readonly toastService: ToastService,
    private readonly cdr: ChangeDetectorRef
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

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.dashboardService
      .getSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.summary = response;
          this.isLoading = false;

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(
            'Error loading dashboard:',
            error
          );

          this.summary = null;
          this.isLoading = false;

          this.errorMessage =
            this.t('dashboard.loadError');

          this.toastService.error(
            this.t('dashboard.loadError')
          );

          this.cdr.detectChanges();
        }
      });
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }

  dateLocale(): string {
    return this.translationService.getCurrentLanguage() === 'es'
      ? 'es-MX'
      : 'en-US';
  }
}