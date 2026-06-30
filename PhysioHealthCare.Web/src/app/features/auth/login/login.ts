import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { Login } from '../../../shared/models/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  login(): void {
    if (this.isLoading) return;

    this.errorMessage = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    const dto: Login = {
      email: this.email.trim(),
      password: this.password
    };

    this.authService.login(dto).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();

        this.router.navigate(['/patients']);
      },

      error: (error) => {
        console.error('Login error', error);

        this.isLoading = false;

        this.errorMessage =
          error.error?.message ||
          error.error?.Message ||
          'Invalid email or password.';

        this.cdr.detectChanges();
      }
    });
  }
}