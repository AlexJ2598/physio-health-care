import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { PatientService } from '../../../core/services/patient';
import { TranslationService } from '../../../core/services/translation';
import { CreatePatient } from '../../../shared/models/patient';

@Component({
  selector: 'app-patient-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './patient-create.html',
  styleUrl: './patient-create.scss',
})
export class PatientCreateComponent {
  isLoading = false;
  errorMessage = '';
  formSubmitted = false;

  patient: CreatePatient = {
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 1,
    phoneNumber: '',
    email: '',
    address: '',
    notes: ''
  };

  constructor(
    private patientService: PatientService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private translationService: TranslationService
  ) {}

  t(key: string): string {
    return this.translationService.translate(key);
  }

  createPatient(): void {
    this.formSubmitted = true;

    if (this.isLoading) {
      return;
    }

    if (
      !this.patient.firstName.trim() ||
      !this.patient.lastName.trim() ||
      !this.patient.birthDate ||
      !this.patient.gender ||
      !this.patient.email?.trim()
    ) {
      this.errorMessage =
        this.t('patients.validation.requiredFields');

      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    this.patientService.create(this.patient).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();

        this.router.navigate(['/patients']);
      },

      error: (error) => {
        console.error('Create patient error', error);

        this.isLoading = false;

        this.errorMessage =
          error.error?.message ||
          error.error?.Message ||
          this.t('patients.create.error');

        this.cdr.detectChanges();
      }
    });
  }
}