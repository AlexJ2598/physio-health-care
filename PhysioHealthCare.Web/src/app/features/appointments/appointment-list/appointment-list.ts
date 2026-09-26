import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

import { AppointmentService } from '../../../core/services/appointment';
import { PatientService } from '../../../core/services/patient';
import { ToastService } from '../../../core/services/toast';
import { TranslationService } from '../../../core/services/translation';
import {
  Appointment,
  AppointmentFilters,
  AppointmentSortField,
  AppointmentStatusValue
} from '../../../shared/models/appointment';
import { Patient } from '../../../shared/models/patient';
import { LoadingComponent } from '../../../shared/components/loading/loading';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.scss',
})
export class AppointmentListComponent implements OnInit, OnDestroy {
  // Data and loading state
  appointments: Appointment[] = [];
  patients: Patient[] = [];

  isLoading = false;
  isLoadingPatients = false;

  errorMessage = '';

  updatingAppointmentId: string | null = null;
  appointmentToCancel: Appointment | null = null;

  // Filters
  searchTerm = '';
  dateFrom = '';
  dateTo = '';

  selectedStatus: AppointmentStatusValue | null = null;
  selectedPatientId = '';

  //Sorting

  sortBy: AppointmentSortField = 'appointmentDate';

  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  get hasPreviousPage(): boolean{
    return this.pageNumber > 1;
  }

  get hasNextPage(): boolean{
    return this.pageNumber < this.totalPages;
  }

  private readonly search$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly patientService: PatientService,
    private readonly toastService: ToastService,
    private readonly translationService: TranslationService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  // Lifecycle

  ngOnInit(): void {
    this.translationService.language$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.detectChanges();
    });

    this.search$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageNumber = 1;
        this.loadAppointments();
      });

    this.loadPatients();
    this.loadAppointments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Data loading

  loadPatients(): void {
    this.isLoadingPatients = true;

    this.patientService.getAll(1, 100, undefined, 'fullName', 'asc').subscribe({
      next: (result) => {
        this.patients = result.items;
        this.isLoadingPatients = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Load patients error', error);

        this.patients = [];
        this.isLoadingPatients = false;

        this.cdr.detectChanges();
      },
    });
  }

  loadAppointments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cdr.detectChanges();

    const filters: AppointmentFilters = {
      search: this.searchTerm.trim() || undefined,
      status: this.selectedStatus ?? undefined,
      patientId: this.selectedPatientId || undefined,
      dateFrom: this.dateFrom ? this.toUtcStartOfDay(this.dateFrom) : undefined,
      dateTo: this.dateTo ? this.toUtcEndOfDay(this.dateTo) : undefined,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection
    };

    this.appointmentService.getAll(this.pageNumber, this.pageSize, filters).subscribe({
      next: (result) => {
        this.appointments = result.items;
        this.pageNumber = result.pageNumber;
        this.pageSize = result.pageSize;
        this.totalCount = result.totalCount;
        this.totalPages = result.totalPages;
        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Load appointments error', error);

        this.isLoading = false;

        this.errorMessage = this.t('appointments.loadError');

        this.cdr.detectChanges();
      },
    });
  }

  // Search and filters

  onSearchChange(value: string): void {
    this.searchTerm = value;

    this.search$.next(value.trim());
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

  filterByPatient(patientId: string): void {
    this.selectedPatientId = patientId;

    this.pageNumber = 1;

    this.loadAppointments();
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status ? (Number(status) as AppointmentStatusValue) : null;

    this.pageNumber = 1;

    this.loadAppointments();
  }

  applyDateRange(): void {
    this.pageNumber = 1;
    this.loadAppointments();
  }

  clearDateRange(): void {
    if (!this.dateFrom && !this.dateTo) {
      return;
    }
    this.dateFrom = '';
    this.dateTo = '';
    this.pageNumber = 1;

    this.loadAppointments();
  }

  //Sorting actions.
  changeSortField(sortBy: string): void{

    this.sortBy = sortBy as AppointmentSortField;

    this.pageNumber = 1;
    this.loadAppointments();
  }

  changeSortDirection(sortDirection: string): void{

    this.sortDirection = sortDirection === 'desc'
    ? 'desc'
    : 'asc';

    this.pageNumber = 1;
    this.loadAppointments();
  }

  //pagination actions

  goToPreviousPage(): void{
    if(!this.hasPreviousPage || this.isLoading){
      return;
    }
    this.pageNumber--;
    this.loadAppointments();
  }

  goToNextPage(): void{
    if(!this.hasNextPage || this.isLoading){
      return;
    }
    this.pageNumber++;
    this.loadAppointments();
  }

  changePageSize(pageSize: string):void{
    const newPageSize = Number(pageSize);
    if(
      !Number.isInteger(newPageSize) ||
      newPageSize <= 0 ||
      newPageSize === this.pageSize
    ){
      return;
    }

    this.pageSize = newPageSize;
    this.pageNumber = 1;

    this.loadAppointments();
  }
  // Appointment actions

  updateStatus(appointment: Appointment, status: AppointmentStatusValue): void {
    if (this.updatingAppointmentId === appointment.id) {
      return;
    }

    this.updatingAppointmentId = appointment.id;

    this.appointmentService
      .updateStatus(appointment.id, {
        status,
      })
      .subscribe({
        next: (updatedAppointment) => {
          this.appointments = this.appointments.map((currentAppointment) =>
            currentAppointment.id === updatedAppointment.id
              ? updatedAppointment
              : currentAppointment,
          );

          this.updatingAppointmentId = null;

          this.toastService.success(this.t('appointments.status.success'));

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Update appointment status error', error);

          this.updatingAppointmentId = null;

          this.toastService.error(
            error.error?.message || error.error?.Message || this.t('appointments.status.error'),
          );

          this.cdr.detectChanges();
        },
      });
  }

  requestCancellation(appointment: Appointment): void {
    if (this.isUpdating(appointment)) {
      return;
    }

    this.appointmentToCancel = appointment;

    this.cdr.detectChanges();
  }

  closeCancellation(): void {
    if (this.appointmentToCancel && this.isUpdating(this.appointmentToCancel)) {
      return;
    }

    this.appointmentToCancel = null;

    this.cdr.detectChanges();
  }

  confirmCancellation(): void {
    if (!this.appointmentToCancel) {
      return;
    }

    const appointment = this.appointmentToCancel;

    this.updateStatus(appointment, 4);

    this.appointmentToCancel = null;

    this.cdr.detectChanges();
  }

  // Template helpers

  isUpdating(appointment: Appointment): boolean {
    return this.updatingAppointmentId === appointment.id;
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }

  // Date conversion: local day boundaries expressed in UTC

  private toUtcStartOfDay(date: string): string {
    const [year, month, day] = date.split('-').map(Number);

    return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
  }

  private toUtcEndOfDay(date: string): string {
    const [year, month, day] = date.split('-').map(Number);

    return new Date(year, month - 1, day, 23, 59, 59, 999).toISOString();
  }
}
