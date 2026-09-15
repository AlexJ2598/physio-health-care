import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import {
  Subject,
  takeUntil
} from 'rxjs';

import {
  SupportedLanguage,
  TranslationService
} from '../../../core/services/translation';

@Component({
  selector: 'app-header',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],

  templateUrl: './app-header.html',

  styleUrl: './app-header.scss'
})
export class AppHeaderComponent
  implements OnInit, OnDestroy {

  currentLanguage: SupportedLanguage = 'en';

  private readonly destroy$ =
    new Subject<void>();

  constructor(
    private router: Router,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.translationService.language$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(language => {

        this.currentLanguage =
          language;

        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();
  }

  t(
    key: string
  ): string {

    return this.translationService
      .translate(key);
  }

  changeLanguage(
    language: SupportedLanguage
  ): void {

    if (
      language === this.currentLanguage
    ) {
      return;
    }

    this.translationService
      .setLanguage(language)
      .subscribe();
  }

  logout(): void {

    localStorage.removeItem(
      'physiohealthcare_token'
    );

    this.router.navigate([
      '/login'
    ]);
  }
}