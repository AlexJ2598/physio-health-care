import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

import { TranslationService } from '../../../core/services/translation';

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
export class AppHeaderComponent {

  constructor(
    private router: Router,
    private translationService: TranslationService
  ) {}

  t(key: string): string {
    return this.translationService.translate(key);
  }

  logout(): void {
    localStorage.removeItem('physiohealthcare_token');
    this.router.navigate(['/login']);
  }
}
