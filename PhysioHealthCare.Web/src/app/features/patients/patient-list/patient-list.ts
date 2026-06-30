import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { PatientService } from '../../../core/services/patient';
import { AuthService } from '../../../core/services/auth';
import { Patient } from '../../../shared/models/patient';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.scss',
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  isLoading = false;
  errorMessage = '';

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
}