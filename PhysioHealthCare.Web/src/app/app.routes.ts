import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { PatientListComponent } from './features/patients/patient-list/patient-list';
import { PatientCreateComponent } from './features/patients/patient-create/patient-create';
import { PatientEditComponent } from './features/patients/patient-edit/patient-edit';
import { authGuard } from './core/guards/auth-guard';
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
    path: 'patients',
    component: PatientListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'patients/create',
    component: PatientCreateComponent,
    canActivate: [authGuard]
  },
  {
  path: 'patients/edit/:id',
  component: PatientEditComponent,
  canActivate: [authGuard]
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