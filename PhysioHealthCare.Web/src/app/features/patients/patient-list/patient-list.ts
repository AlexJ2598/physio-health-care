import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { PatientService } from '../../../core/services/patient';
import { TranslationService } from '../../../core/services/translation';
import { Patient } from '../../../shared/models/patient';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.scss',
})
export class PatientListComponent implements OnInit {

  patients: Patient[] = [];

  isLoading = false;

  errorMessage = '';

  showDeleteModal = false;

  selectedPatient: Patient | null = null;

  isDeleting = false;

  successMessage = '';

  searchTerm = '';

  constructor(
    private patientService: PatientService,
    private cdr: ChangeDetectorRef,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cdr.detectChanges();

    this.patientService
      .getAll()
      .subscribe({

        next: (patients) => {
          this.patients = patients;

          this.isLoading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Load patients error',
            error
          );

          this.errorMessage =
            this.t('patients.loadError');

          this.isLoading = false;

          this.cdr.detectChanges();
        }

      });
  }

  openDeleteModal(patient: Patient): void {
    this.selectedPatient = patient;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.selectedPatient = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (
      !this.selectedPatient ||
      this.isDeleting
    ) {
      return;
    }

    this.isDeleting = true;

    this.patientService
      .delete(this.selectedPatient.id)
      .subscribe({

        next: () => {
          this.isDeleting = false;

          this.closeDeleteModal();

          this.successMessage =
            this.t('patients.deletedSuccess');

          this.loadPatients();

          setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
          }, 3000);

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error(
            'Delete patient error',
            error
          );

          this.isDeleting = false;

          this.errorMessage =
            this.t('patients.deleteError');

          this.cdr.detectChanges();
        }

      });
  }

  get filteredPatients(): Patient[] {
    const term =
      this.searchTerm
        .trim()
        .toLowerCase();

    if (!term) {
      return this.patients;
    }

    return this.patients.filter(patient =>
      patient.fullName
        .toLowerCase()
        .includes(term) ||

      patient.email
        ?.toLowerCase()
        .includes(term) ||

      patient.phoneNumber
        ?.toLowerCase()
        .includes(term)
    );
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }
}