import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';

import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  tap
} from 'rxjs';

type Translations = Record<string, string>;

export type SupportedLanguage =
  | 'es'
  | 'en';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  private readonly languageStorageKey =
    'physiohealthcare_language';

  private translations: Translations = {};

  private currentLanguage: SupportedLanguage = 'en';

  private readonly languageSubject =
    new BehaviorSubject<SupportedLanguage>('en');

  readonly language$ =
    this.languageSubject.asObservable();

  constructor(
    private http: HttpClient
  ) {}

  load(): Observable<Translations> {

    const savedLanguage =
      localStorage.getItem(
        this.languageStorageKey
      );

    if (
      savedLanguage === 'es' ||
      savedLanguage === 'en'
    ) {
      this.currentLanguage =
        savedLanguage;
    } else {
      const browserLanguage =
        navigator.language.toLowerCase();

      this.currentLanguage =
        browserLanguage.startsWith('es')
          ? 'es'
          : 'en';
    }

    return this.loadTranslations(
      this.currentLanguage
    );
  }

  setLanguage(
    language: SupportedLanguage
  ): Observable<Translations> {

    if (
      language === this.currentLanguage
    ) {
      return of(this.translations);
    }

    return this.loadTranslations(
      language
    ).pipe(
      tap(() => {
        localStorage.setItem(
          this.languageStorageKey,
          language
        );
      })
    );
  }

  translate(
    key: string
  ): string {

    return this.translations[key] ?? key;
  }

  getCurrentLanguage():
    SupportedLanguage {

    return this.currentLanguage;
  }

  private loadTranslations(
    language: SupportedLanguage
  ): Observable<Translations> {

    return this.http
      .get<Translations>(
        `/i18n/${language}.json`
      )
      .pipe(
        tap(translations => {

          this.translations =
            translations;

          this.currentLanguage =
            language;

          this.languageSubject.next(
            language
          );
        }),

        catchError(error => {

          console.error(
            `Error loading ${language} translations:`,
            error
          );

          return of(
            this.translations
          );
        })
      );
  }
}