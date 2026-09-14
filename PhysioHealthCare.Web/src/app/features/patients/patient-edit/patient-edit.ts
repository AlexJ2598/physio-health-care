import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { PatientService } from '../../../core/services/patient';
import { ToastService } from '../../../core/services/toast';
import { TranslationService } from '../../../core/services/translation';

import { LoadingComponent } from '../../../shared/components/loading/loading';
import { UpdatePatient } from '../../../shared/models/patient';

@Component({
  selector: 'app-patient-edit',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LoadingComponent
  ],

  templateUrl: './patient-edit.html',
  styleUrl: './patient-edit.scss',
})
export class PatientEditComponent implements OnInit {

  patientId = '';

  isLoading = false;

  isSaving = false;

  errorMessage = '';

  formSubmitted = false;

  patient: UpdatePatient = {
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
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private cdr: ChangeDetectorRef,
    private translationService: TranslationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {

    this.patientId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.patientId) {

      this.router.navigate([
        '/not-found'
      ]);

      return;
    }

    this.loadPatient();
  }

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

  loadPatient(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();

    this.patientService
      .getById(this.patientId)
      .subscribe({
        next: (patient: any) => {

          console.log(
            'Patient loaded:',
            patient
          );

          this.patient = {
            firstName:
              patient.firstName ?? '',

            lastName:
              patient.lastName ?? '',

            birthDate:
              patient.birthDate
                ?.substring(0, 10) ?? '',

            gender:
              patient.gender,

            phoneNumber:
              patient.phoneNumber ?? '',

            email:
              patient.email ?? '',

            address:
              patient.address ?? '',

            notes:
              patient.notes ?? ''
          };

          this.isLoading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Load patient error',
            error
          );

          this.isLoading = false;

          if (error.status === 404) {

            this.router.navigate([
              '/not-found'
            ]);

            return;
          }

          this.errorMessage =
            this.t(
              'patients.edit.loadError'
            );

          this.cdr.detectChanges();
        }
      });
  }

  updatePatient(): void {

    this.formSubmitted = true;

    if (this.isSaving) {
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

    this.isSaving = true;

    this.cdr.detectChanges();

    this.patientService
      .update(
        this.patientId,
        this.patient
      )
      .subscribe({
        next: () => {

          this.isSaving = false;

          this.toastService.success(
            this.t(
              'patients.edit.success'
            )
          );

          this.router.navigate([
            '/patients'
          ]);
        },

        error: (error) => {

          console.error(
            'Update patient error',
            error
          );

          this.isSaving = false;

          this.errorMessage =
            error.error?.message ||
            error.error?.Message ||
            this.t(
              'patients.edit.error'
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