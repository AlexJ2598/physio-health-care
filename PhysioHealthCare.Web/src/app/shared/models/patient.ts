export type PatientGender =
  | 'Male'
  | 'Female'
  | 'Other';

export type PatientGenderValue =
  | 1
  | 2
  | 3;

export type PatientSortField =
  | 'fullName'
  | 'birthDate'
  | 'gender'
  | 'phoneNumber'
  | 'email';

export type SortDirection =
  | 'asc'
  | 'desc';


export interface Patient {
  id: string;

  fullName: string;

  birthDate: string;

  gender: PatientGender;

  phoneNumber: string;

  email: string;
}


export interface CreatePatient {
  firstName: string;

  lastName: string;

  birthDate: string;

  gender: PatientGenderValue;

  phoneNumber?: string;

  email?: string;

  address?: string;

  notes?: string;
}


export interface UpdatePatient {
  firstName: string;

  lastName: string;

  birthDate: string;

  gender: PatientGenderValue;

  phoneNumber?: string;

  email?: string;

  address?: string;

  notes?: string;
}


export interface PatientDetail {
  id: string;

  firstName: string;

  lastName: string;

  birthDate: string;

  gender: PatientGenderValue;

  phoneNumber: string | null;

  email: string | null;

  address: string | null;

  notes: string | null;
}