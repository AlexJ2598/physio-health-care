import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../core/services/patient';
import { AuthService } from '../../../core/services/auth';
import { Patient } from '../../../shared/models/patient';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Load patients error', error);

        this.errorMessage = 'Error loading patients.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

 logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  deletePatient(id: string): void {
  console.log('Delete patient:', id);
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
  if (!this.selectedPatient || this.isDeleting) return;

  this.isDeleting = true;

  this.patientService.delete(this.selectedPatient.id).subscribe({
    next: () => {
  this.isDeleting = false;
  this.closeDeleteModal();

  this.successMessage = 'Patient deleted successfully.';

  this.loadPatients();

  setTimeout(() => {
    this.successMessage = '';
    this.cdr.detectChanges();
  }, 3000);

  this.cdr.detectChanges();
  },
    error: (error) => {
      console.error('Delete patient error', error);

      this.isDeleting = false;
      this.errorMessage = 'Error deleting patient.';
    }
  });
}  
get filteredPatients(): Patient[] {
  const term = this.searchTerm.trim().toLowerCase();

  if (!term) {
    return this.patients;
  }

  return this.patients.filter(patient =>
    patient.fullName.toLowerCase().includes(term) ||
    patient.email?.toLowerCase().includes(term) ||
    patient.phoneNumber?.toLowerCase().includes(term)
  );
}
}