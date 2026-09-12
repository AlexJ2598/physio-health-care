import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, tap } from 'rxjs';

type Translations = Record<string, string>;

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: Translations = {};
  private currentLanguage = 'en';

  constructor(private http: HttpClient) {}

  load(): Observable<Translations> {
    const browserLanguage = navigator.language.toLowerCase();

    this.currentLanguage = browserLanguage.startsWith('es')
      ? 'es'
      : 'en';

    return this.http
      .get<Translations>(`/i18n/${this.currentLanguage}.json`)
      .pipe(
        tap(translations => {
          this.translations = translations;
        }),
        catchError(error => {
          console.error('Error loading translations:', error);

          this.translations = {};

          return of({});
        })
      );
  }

  translate(key: string): string {
    return this.translations[key] ?? key;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }
}