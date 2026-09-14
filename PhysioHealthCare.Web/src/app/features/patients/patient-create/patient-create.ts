import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import { PatientService } from '../../../core/services/patient';
import { ToastService } from '../../../core/services/toast';
import { TranslationService } from '../../../core/services/translation';

import { LoadingComponent } from '../../../shared/components/loading/loading';
import { CreatePatient } from '../../../shared/models/patient';

@Component({
  selector: 'app-patient-create',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LoadingComponent
  ],

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
    private translationService: TranslationService,
    private toastService: ToastService
  ) {}

  t(key: string): string {
    return this.translationService.translate(key);
  }

  get maxBirthDate(): string {
    const yesterday = new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const year =
      yesterday.getFullYear();

    const month = String(
      yesterday.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      yesterday.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
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
      !this.isValidGender(
        this.patient.gender
      )
    ) {
      this.errorMessage =
        this.t(
          'patients.validation.requiredFields'
        );

      this.cdr.detectChanges();

      return;
    }

    if (
      !this.isBirthDateValid(
        this.patient.birthDate
      )
    ) {
      this.errorMessage =
        this.t(
          'patients.validation.birthDatePast'
        );

      this.cdr.detectChanges();

      return;
    }

    this.errorMessage = '';

    this.isLoading = true;

    this.cdr.detectChanges();

    this.patientService
      .create(this.patient)
      .subscribe({
        next: () => {

          this.isLoading = false;

          this.toastService.success(
            this.t(
              'patients.create.success'
            )
          );

          this.router.navigate([
            '/patients'
          ]);
        },

        error: (error) => {

          console.error(
            'Create patient error',
            error
          );

          this.isLoading = false;

          this.errorMessage =
            error.error?.message ||
            error.error?.Message ||
            this.t(
              'patients.create.error'
            );

          this.cdr.detectChanges();
        }
      });
  }

  private isBirthDateValid(
    birthDateValue: string
  ): boolean {

    const parts =
      birthDateValue
        .split('-')
        .map(Number);

    if (parts.length !== 3) {
      return false;
    }

    const [
      year,
      month,
      day
    ] = parts;

    if (
      !year ||
      !month ||
      !day
    ) {
      return false;
    }

    const birthDate = new Date(
      year,
      month - 1,
      day
    );

    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    return birthDate < today;
  }

  private isValidGender(
    gender: number
  ): boolean {

    return (
      gender >= 1 &&
      gender <= 3
    );
  }
}