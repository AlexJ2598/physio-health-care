import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { PatientService } from '../../../core/services/patient';
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
    private cdr: ChangeDetectorRef
  ) {}

  createPatient(): void {
    if (this.isLoading) return;

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
          'Error creating patient.';

        this.cdr.detectChanges();
      }
    });
  }
}