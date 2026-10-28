
import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';

import { AppointmentListComponent } from './features/appointments/appointment-list/appointment-list';
import { AppointmentCreateComponent } from './features/appointments/appointment-create/appointment-create';
import { AppointmentDetail } from './features/appointments/appointment-detail/appointment-detail';
import { AppointmentEditComponent } from './features/appointments/appointment-edit/appointment-edit';

import { ClinicalHistoryDetail } from './features/clinical-records/clinical-history-detail/clinical-history-detail';
import { ClinicalHistoryForm } from './features/clinical-records/clinical-history-form/clinical-history-form';
import { ClinicalRecordDetail } from './features/clinical-records/clinical-record-detail/clinical-record-detail';

import { Dashboard } from './features/dashboard/dashboard';

import { LoginComponent } from './features/auth/login/login';

import { PatientCreateComponent } from './features/patients/patient-create/patient-create';
import { PatientEditComponent } from './features/patients/patient-edit/patient-edit';
import { PatientListComponent } from './features/patients/patient-list/patient-list';

import { AppLayoutComponent } from './layout/app-layout/app-layout';
import { NotFoundComponent } from './shared/components/not-found/not-found';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [

      // ==========================================
      // Patients
      // ==========================================
      {
        path: 'patients',
        component: PatientListComponent,
      },
      {
        path: 'patients/create',
        component: PatientCreateComponent,
      },
      {
        path: 'patients/edit/:id',
        component: PatientEditComponent,
      },

      // ==========================================
      // Clinical records
      // ==========================================
      {
        path: 'patients/:id/clinical-record/history/form',
        component: ClinicalHistoryForm,
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'patients/:id/clinical-record/history',
        component: ClinicalHistoryDetail,
      },
      {
        path: 'patients/:id/clinical-record',
        component: ClinicalRecordDetail,
      },

      // ==========================================
      // Appointments
      // ==========================================
      {
        path: 'appointments',
        component: AppointmentListComponent,
      },
      {
        path: 'appointments/create',
        component: AppointmentCreateComponent,
      },
      {
        path: 'appointments/edit/:id',
        component: AppointmentEditComponent,
      },
      {
        path: 'appointments/:id',
        component: AppointmentDetail,
      },

      // ==========================================
      // Dashboard
      // ==========================================
      {
        path: 'dashboard',
        component: Dashboard,
      },
    ],
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
