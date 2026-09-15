import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';

import { RouterLink } from '@angular/router';

import { PatientService } from '../../../core/services/patient';

import { ToastService } from '../../../core/services/toast';

import { TranslationService } from '../../../core/services/translation';

import { LoadingComponent } from '../../../shared/components/loading/loading';

import {
  Patient,
  PatientGender,
  PatientSortField,
  SortDirection
} from '../../../shared/models/patient';

@Component({
  selector: 'app-patient-list',

  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LoadingComponent
  ],

  templateUrl: './patient-list.html',

  styleUrl: './patient-list.scss',
})
export class PatientListComponent
  implements OnInit, OnDestroy {

  patients: Patient[] = [];

  isLoading = false;

  errorMessage = '';

  showDeleteModal = false;

  selectedPatient: Patient | null = null;

  isDeleting = false;

  searchTerm = '';

  pageNumber = 1;

  pageSize = 10;

  totalCount = 0;

  totalPages = 0;

  sortBy?: PatientSortField;

  sortDirection: SortDirection = 'asc';

  private searchTimeout:
    ReturnType<typeof setTimeout> | null = null;

  constructor(
    private patientService: PatientService,
    private cdr: ChangeDetectorRef,
    private translationService: TranslationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  ngOnDestroy(): void {

    if (this.searchTimeout) {
      clearTimeout(
        this.searchTimeout
      );
    }
  }

  loadPatients(): void {

    this.isLoading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();

    this.patientService
      .getAll(
        this.pageNumber,
        this.pageSize,
        this.searchTerm,
        this.sortBy,
        this.sortDirection
      )
      .subscribe({
        next: (result) => {

          this.patients =
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

        error: (error) => {

          console.error(
            'Load patients error',
            error
          );

          this.errorMessage =
            this.t(
              'patients.loadError'
            );

          this.isLoading = false;

          this.cdr.detectChanges();
        }
      });
  }

  onSearchChange(): void {

    if (this.searchTimeout) {
      clearTimeout(
        this.searchTimeout
      );
    }

    this.searchTimeout =
      setTimeout(() => {

        this.pageNumber = 1;

        this.loadPatients();

      }, 400);
  }

  sort(
    field: PatientSortField
  ): void {

    if (this.isLoading) {
      return;
    }

    if (this.sortBy === field) {

      this.sortDirection =
        this.sortDirection === 'asc'
          ? 'desc'
          : 'asc';

    } else {

      this.sortBy = field;

      this.sortDirection = 'asc';
    }

    this.pageNumber = 1;

    this.loadPatients();
  }

  getSortIndicator(
    field: PatientSortField
  ): string {

    if (this.sortBy !== field) {
      return '';
    }

    return this.sortDirection === 'asc'
      ? '↑'
      : '↓';
  }

  previousPage(): void {

    if (
      this.pageNumber <= 1 ||
      this.isLoading
    ) {
      return;
    }

    this.pageNumber--;

    this.loadPatients();
  }

  nextPage(): void {

    if (
      this.pageNumber >= this.totalPages ||
      this.isLoading
    ) {
      return;
    }

    this.pageNumber++;

    this.loadPatients();
  }

  goToPage(
    page: number
  ): void {

    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.pageNumber ||
      this.isLoading
    ) {
      return;
    }

    this.pageNumber = page;

    this.loadPatients();
  }

  get pages(): number[] {

    return Array.from(
      {
        length: this.totalPages
      },
      (_, index) =>
        index + 1
    );
  }

  openDeleteModal(
    patient: Patient
  ): void {

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
      .delete(
        this.selectedPatient.id
      )
      .subscribe({
        next: () => {

          this.isDeleting = false;

          this.closeDeleteModal();

          this.toastService.success(
            this.t(
              'patients.deletedSuccess'
            )
          );

          if (
            this.patients.length === 1 &&
            this.pageNumber > 1
          ) {
            this.pageNumber--;
          }

          this.loadPatients();

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Delete patient error',
            error
          );

          this.isDeleting = false;

          this.toastService.error(
            this.t(
              'patients.deleteError'
            )
          );

          this.cdr.detectChanges();
        }
      });
  }

  getGenderTranslation(
    gender: PatientGender
  ): string {

    switch (gender) {

      case 'Male':
        return this.t(
          'patients.gender.male'
        );

      case 'Female':
        return this.t(
          'patients.gender.female'
        );

      case 'Other':
        return this.t(
          'patients.gender.other'
        );
    }
  }

  t(
    key: string
  ): string {

    return this.translationService
      .translate(key);
  }
}