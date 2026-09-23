import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  Subject,
  takeUntil
} from 'rxjs';

import {
  AppointmentService
} from '../../../core/services/appointment';
import {
  TranslationService
} from '../../../core/services/translation';
import {
  Appointment
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

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  private readonly destroy$ =
    new Subject<void>();

  constructor(
    private appointmentService: AppointmentService,
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

    this.appointmentService
      .getAll(
        this.pageNumber,
        this.pageSize
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

  t(key: string): string {
    return this.translationService
      .translate(key);
  }
}