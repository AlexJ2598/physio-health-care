import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth-guard';
import { AppointmentListComponent } from './features/appointments/appointment-list/appointment-list';
import { AppointmentCreateComponent } from './features/appointments/appointment-create/appointment-create';
import {
  AppointmentEditComponent
} from './features/appointments/appointment-edit/appointment-edit';
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
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'patients',
        component: PatientListComponent
      },
      {
        path: 'patients/create',
        component: PatientCreateComponent
      },
      {
        path: 'patients/edit/:id',
        component: PatientEditComponent
      },
      {
        path: 'appointments',
        component: AppointmentListComponent
      },
      {
        path: 'appointments/create',
        component: AppointmentCreateComponent
      },
      {
        path: 'appointments/edit/:id',
        component: AppointmentEditComponent
      }
    ]
  },
  {
    path: 'not-found',
    component: NotFoundComponent
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];