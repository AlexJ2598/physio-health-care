import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { PatientListComponent } from './features/patients/patient-list/patient-list';
import { PatientCreateComponent } from './features/patients/patient-create/patient-create';

import { authGuard } from './core/guards/auth-guard';

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
    path: 'patients',
    component: PatientListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'patients/create',
    component: PatientCreateComponent,
    canActivate: [authGuard]
  }
];