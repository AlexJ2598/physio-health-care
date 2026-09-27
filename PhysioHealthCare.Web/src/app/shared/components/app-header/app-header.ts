import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { SupportedLanguage, TranslationService } from '../../../core/services/translation';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  // State and configuration

  currentLanguage: SupportedLanguage = 'en';
  private readonly destroy$ = new Subject<void>();

  // Dependencies

  constructor(
    private router: Router,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef,
  ) {}

  // Lifecycle

  ngOnInit(): void {
    this.translationService.language$.pipe(takeUntil(this.destroy$)).subscribe((language) => {
      this.currentLanguage = language;

      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();

    this.destroy$.complete();
  }

  // Authentication

  logout(): void {
    localStorage.removeItem('physiohealthcare_token');

    this.router.navigate(['/login']);
  }

  // Language selection

  changeLanguage(language: SupportedLanguage): void {
    if (language === this.currentLanguage) {
      return;
    }

    this.translationService.setLanguage(language).subscribe();
  }

  // Template helpers

  t(key: string): string {
    return this.translationService.translate(key);
  }
}
