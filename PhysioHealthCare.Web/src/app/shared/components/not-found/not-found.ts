import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss'
})
export class NotFoundComponent {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  goHome(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/patients']);
      return;
    }

    this.router.navigate(['/login']);
  }
}