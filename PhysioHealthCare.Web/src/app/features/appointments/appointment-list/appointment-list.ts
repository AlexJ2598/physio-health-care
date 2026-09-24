import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
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
  Appointment,
  AppointmentFilters,
  AppointmentStatusValue
} from '../../../shared/models/appointment';

import {
  LoadingComponent
} from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingComponent
  ],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.scss'
})
export class AppointmentListComponent
  implements OnInit, OnDestroy {

  appointments: Appointment[] = [];

  isLoading = false;
  errorMessage = '';

  updatingAppointmentId: string | null = null;
  appointmentToCancel: Appointment | null = null;

  searchTerm = '';

  selectedStatus:
    AppointmentStatusValue | null = null;

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  private readonly destroy$ =
    new Subject<void>();

  constructor(
    private appointmentService: AppointmentService,
    private toastService: ToastService,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.translationService.language$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.cdr.detectChanges();
      });

    this.loadAppointments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cdr.detectChanges();

    const filters: AppointmentFilters = {
      search:
        this.searchTerm.trim() ||
        undefined,

      status:
        this.selectedStatus ??
        undefined
    };

    this.appointmentService
      .getAll(
        this.pageNumber,
        this.pageSize,
        filters
      )
      .subscribe({
        next: result => {
          this.appointments =
            result.items;

          this.pageNumber =
            result.pageNumber;

          this.pageSize =
            result.pageSize;

          this.totalCount =
            result.totalCount;

          this.totalPages =
            result.totalPages;

          this.isLoading = false;

          this.cdr.detectChanges();
        },

        error: error => {
          console.error(
            'Load appointments error',
            error
          );

          this.isLoading = false;

          this.errorMessage =
            this.t(
              'appointments.loadError'
            );

          this.cdr.detectChanges();
        }
      });
  }

  searchAppointments(): void {
    this.pageNumber = 1;
    this.loadAppointments();
  }

  clearSearch(): void {
    if (!this.searchTerm) {
      return;
    }

    this.searchTerm = '';
    this.pageNumber = 1;

    this.loadAppointments();
  }

  filterByStatus(
    status: string
  ): void {
    this.selectedStatus =
      status
        ? Number(status) as AppointmentStatusValue
        : null;

    this.pageNumber = 1;

    this.loadAppointments();
  }

  updateStatus(
    appointment: Appointment,
    status: AppointmentStatusValue
  ): void {
    if (
      this.updatingAppointmentId ===
      appointment.id
    ) {
      return;
    }

    this.updatingAppointmentId =
      appointment.id;

    this.appointmentService
      .updateStatus(
        appointment.id,
        {
          status
        }
      )
      .subscribe({
        next: updatedAppointment => {
          this.appointments =
            this.appointments.map(
              currentAppointment =>
                currentAppointment.id ===
                updatedAppointment.id
                  ? updatedAppointment
                  : currentAppointment
            );

          this.updatingAppointmentId =
            null;

          this.toastService.success(
            this.t(
              'appointments.status.success'
            )
          );

          this.cdr.detectChanges();
        },

        error: error => {
          console.error(
            'Update appointment status error',
            error
          );

          this.updatingAppointmentId =
            null;

          this.toastService.error(
            error.error?.message ||
            error.error?.Message ||
            this.t(
              'appointments.status.error'
            )
          );

          this.cdr.detectChanges();
        }
      });
  }

  requestCancellation(
    appointment: Appointment
  ): void {
    if (this.isUpdating(appointment)) {
      return;
    }

    this.appointmentToCancel =
      appointment;

    this.cdr.detectChanges();
  }

  closeCancellation(): void {
    if (
      this.appointmentToCancel &&
      this.isUpdating(
        this.appointmentToCancel
      )
    ) {
      return;
    }

    this.appointmentToCancel = null;

    this.cdr.detectChanges();
  }

  confirmCancellation(): void {
    if (!this.appointmentToCancel) {
      return;
    }

    const appointment =
      this.appointmentToCancel;

    this.updateStatus(
      appointment,
      4
    );

    this.appointmentToCancel = null;

    this.cdr.detectChanges();
  }

  isUpdating(
    appointment: Appointment
  ): boolean {
    return (
      this.updatingAppointmentId ===
      appointment.id
    );
  }

  t(key: string): string {
    return this.translationService
      .translate(key);
  }
}