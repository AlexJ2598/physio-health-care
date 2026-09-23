import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import {
  Subject,
  takeUntil
} from 'rxjs';

import {
  AppointmentService
} from '../../../core/services/appointment';
import {
  ToastService
} from '../../../core/services/toast';
import {
  TranslationService
} from '../../../core/services/translation';
import {
  LoadingComponent
} from '../../../shared/components/loading/loading';
import {
  UpdateAppointment
} from '../../../shared/models/appointment';

@Component({
  selector: 'app-appointment-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LoadingComponent
  ],
  templateUrl: './appointment-edit.html',
  styleUrl: './appointment-edit.scss'
})
export class AppointmentEditComponent
  implements OnInit, OnDestroy {

  appointmentId = '';
  patientName = '';

  appointmentDate = '';
  reason = '';
  notes = '';

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  formSubmitted = false;

  private readonly destroy$ =
    new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef,
    private translationService: TranslationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.translationService.language$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.cdr.detectChanges();
      });

    this.appointmentId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.appointmentId) {
      this.router.navigate([
        '/not-found'
      ]);
      return;
    }

    this.loadAppointment();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  t(key: string): string {
    return this.translationService
      .translate(key);
  }

  loadAppointment(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.appointmentService
      .getById(this.appointmentId)
      .subscribe({
        next: appointment => {
          this.patientName =
            appointment.patientName;

          this.appointmentDate =
            this.toLocalDateTimeInput(
              appointment.appointmentDate
            );

          this.reason =
            appointment.reason;

          this.notes =
            appointment.notes ?? '';

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: error => {
          console.error(
            'Load appointment error',
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
              'appointments.edit.loadError'
            );

          this.cdr.detectChanges();
        }
      });
  }

  updateAppointment(): void {
    this.formSubmitted = true;

    if (this.isSaving) {
      return;
    }

    if (
      !this.appointmentDate ||
      !this.reason.trim()
    ) {
      this.errorMessage =
        this.t(
          'appointments.validation.requiredFields'
        );

      this.cdr.detectChanges();
      return;
    }

    this.errorMessage = '';
    this.isSaving = true;
    this.cdr.detectChanges();

    const appointment: UpdateAppointment = {
      appointmentDate:
        new Date(
          this.appointmentDate
        ).toISOString(),
      reason: this.reason.trim(),
      notes:
        this.notes.trim() || undefined
    };

    this.appointmentService
      .update(
        this.appointmentId,
        appointment
      )
      .subscribe({
        next: () => {
          this.isSaving = false;

          this.toastService.success(
            this.t(
              'appointments.edit.success'
            )
          );

          this.router.navigate([
            '/appointments'
          ]);
        },
        error: error => {
          console.error(
            'Update appointment error',
            error
          );

          this.isSaving = false;

          this.errorMessage =
            error.error?.message ||
            error.error?.Message ||
            this.t(
              'appointments.edit.error'
            );

          this.cdr.detectChanges();
        }
      });
  }

  private toLocalDateTimeInput(
    utcDate: string
  ): string {
    const date = new Date(utcDate);

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    const hours =
      String(
        date.getHours()
      ).padStart(2, '0');

    const minutes =
      String(
        date.getMinutes()
      ).padStart(2, '0');

    return (
      `${year}-${month}-${day}` +
      `T${hours}:${minutes}`
    );
  }
}