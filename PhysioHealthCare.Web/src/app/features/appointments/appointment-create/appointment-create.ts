import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  Subject,
  takeUntil
} from 'rxjs';

import {
  AppointmentService
} from '../../../core/services/appointment';
import {
  PatientService
} from '../../../core/services/patient';
import {
  ToastService
} from '../../../core/services/toast';
import {
  TranslationService
} from '../../../core/services/translation';
import {
  CreateAppointment
} from '../../../shared/models/appointment';
import {
  Patient
} from '../../../shared/models/patient';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './appointment-create.html',
  styleUrl: './appointment-create.scss'
})
export class AppointmentCreateComponent
  implements OnInit, OnDestroy {

  patients: Patient[] = [];

  patientId = '';
  appointmentDate = '';
  reason = '';
  notes = '';

  isLoadingPatients = false;
  isSaving = false;
  errorMessage = '';

  private readonly destroy$ =
    new Subject<void>();

  constructor(
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private toastService: ToastService,
    private translationService: TranslationService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.translationService.language$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cdr.detectChanges();
      });

    this.loadPatients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPatients(): void {
    this.isLoadingPatients = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.patientService
      .getAll(
        1,
        100,
        undefined,
        'fullName',
        'asc'
      )
      .subscribe({
        next: result => {
          this.patients = result.items;
          this.isLoadingPatients = false;
          this.cdr.detectChanges();
        },
        error: error => {
          console.error(
            'Load patients error',
            error
          );

          this.isLoadingPatients = false;

          this.errorMessage = this.t(
            'appointments.create.loadPatientsError'
          );

          this.cdr.detectChanges();
        }
      });
  }

  createAppointment(): void {
    if (!this.isFormValid()) {
      this.toastService.error(
        this.t(
          'appointments.validation.requiredFields'
        )
      );

      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    const appointment: CreateAppointment = {
      patientId: this.patientId,

      appointmentDate: new Date(
        this.appointmentDate
      ).toISOString(),

      reason: this.reason.trim(),

      notes:
        this.notes.trim() || undefined
    };

    this.appointmentService
      .create(appointment)
      .subscribe({
        next: () => {
          this.isSaving = false;

          this.toastService.success(
            this.t(
              'appointments.create.success'
            )
          );

          this.router.navigate([
            '/appointments'
          ]);
        },
        error: error => {
          console.error(
            'Create appointment error',
            error
          );

          this.isSaving = false;

          this.errorMessage = this.t(
            'appointments.create.error'
          );

          this.toastService.error(
            this.errorMessage
          );

          this.cdr.detectChanges();
        }
      });
  }

  t(key: string): string {
    return this.translationService
      .translate(key);
  }

  private isFormValid(): boolean {
    return Boolean(
      this.patientId &&
      this.appointmentDate &&
      this.reason.trim()
    );
  }
}